from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewSerializer, LawyerReviewSummarySerializer
from authentication.models import User
from consultation.models import Consultation
from appointment.models import Appointment
from case.models import Case


class ReviewListCreateView(generics.ListCreateAPIView):
    """
    List all reviews or create a new one.
    GET /api/reviews/?lawyer_id=4
    POST /api/reviews/
    
    GET: Returns all reviews for a specific lawyer (query param: lawyer_id)
    POST: Only authenticated clients with completed consultations or cases can create reviews
    """
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Get all reviews, optionally filtered by lawyer_id or client_id"""
        queryset = Review.objects.all()

        lawyer_id = self.request.query_params.get('lawyer_id', None)
        client_id = self.request.query_params.get('client_id', None)

        if lawyer_id:
            queryset = queryset.filter(lawyer_id=lawyer_id)
        if client_id:
            queryset = queryset.filter(client_id=client_id)

        return queryset.order_by('-created_at')

    def _has_completed_interaction(self, client, lawyer):
        """
        Check if client has any completed appointments or cases with the lawyer.
        Rating is allowed AFTER appointment is completed, not just after consultation is accepted.
        
        Flow: Consultation accepted → Appointment created → Appointment completed → CAN RATE
        """
        # Check for completed appointments (linked via consultation)
        # This is the PRIMARY way clients rate - after their scheduled appointment is done
        completed_appointment = Appointment.objects.filter(
            consultation__client=client,
            consultation__lawyer=lawyer,
            status=Appointment.STATUS_COMPLETED
        ).exists()
        
        if completed_appointment:
            return True
        
        # Also allow rating if they completed a case with the lawyer
        completed_case = Case.objects.filter(
            client=client,
            lawyer=lawyer,
            status='completed'
        ).exists()
        
        return completed_case

    def create(self, request, *args, **kwargs):
        """Override create to add validation before serializer"""
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {'error': 'You must be authenticated to leave a review'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get lawyer_id from request data
        lawyer_id = request.data.get('lawyer_id')
        
        if not lawyer_id:
            return Response(
                {'error': 'lawyer_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Lawyer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate that client has completed interaction with lawyer
        if not self._has_completed_interaction(request.user, lawyer):
            return Response(
                {
                    'error': 'You can only rate lawyers after completing a consultation or case with them.',
                    'can_rate': False
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if client has already reviewed this lawyer (prevent duplicate reviews)
        existing_review = Review.objects.filter(
            client=request.user,
            lawyer=lawyer
        ).exists()
        
        if existing_review:
            return Response(
                {
                    'error': 'You have already reviewed this lawyer. Each lawyer can only be rated once per client.',
                    'already_reviewed': True
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        lawyer_id = self.request.data.get('lawyer_id')
        lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        serializer.save(client=self.request.user, lawyer=lawyer)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific review.
    GET/PUT/PATCH/DELETE /api/reviews/<pk>/
    """
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    queryset = Review.objects.all()


class LawyerReviewSummaryView(APIView):
    """
    Get dynamic review summary for a specific lawyer.
    GET /api/reviews/lawyer_summary/?lawyer_id=1
    
    Returns:
    - average_rating: Dynamic calculation from all reviews
    - total_reviews: Dynamic count of reviews
    - rating_distribution: Dynamic breakdown of ratings
    - recent_reviews: Dynamic list of recent reviews
    - has_reviews: Boolean flag indicating if reviews exist
    - message: Helpful message when no reviews exist
    """
    permission_classes = [AllowAny]

    def get(self, request):
        lawyer_id = request.query_params.get('lawyer_id')

        if not lawyer_id:
            return Response(
                {'error': 'lawyer_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Lawyer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reviews = Review.objects.filter(lawyer=lawyer)

        # Calculate statistics dynamically
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        total_reviews = reviews.count()
        has_reviews = total_reviews > 0

        # Rating distribution
        rating_dist = {}
        for i in range(1, 6):
            rating_dist[i] = reviews.filter(rating=i).count()

        # Recent reviews
        recent = reviews[:5]

        summary = {
            'lawyer_id': lawyer.id,
            'lawyer_name': lawyer.name,
            'average_rating': round(avg_rating, 2),
            'total_reviews': total_reviews,
            'rating_distribution': rating_dist,
            'recent_reviews': ReviewSerializer(recent, many=True, context={'request': request}).data,
            'has_reviews': has_reviews,
            'message': 'No reviews yet. Be the first to share your feedback!' if not has_reviews else None
        }

        return Response(summary, status=status.HTTP_200_OK)


class TopLawyersView(APIView):
    """
    Get top-rated lawyers sorted by average rating.
    GET /api/reviews/top_lawyers/?limit=10
    
    Returns dynamically calculated ratings for each lawyer
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            limit = 10

        top_lawyers = User.objects.filter(is_lawyer=True).annotate(
            avg_rating=Avg('reviews_received__rating'),
            review_count=Count('reviews_received')
        ).filter(review_count__gt=0).order_by('-avg_rating')[:limit]

        data = [
            {
                'id': lawyer.id,
                'name': lawyer.name,
                'specialization': lawyer.lawyer_kyc.specializations if hasattr(lawyer, 'lawyer_kyc') and lawyer.lawyer_kyc else [],
                'average_rating': round(lawyer.avg_rating or 0, 2),
                'total_reviews': lawyer.review_count,
                'profile_image': lawyer.profile_image.url if lawyer.profile_image else None,
            }
            for lawyer in top_lawyers
        ]

        return Response(data, status=status.HTTP_200_OK)


class SubmitReviewView(APIView):
    """
    Submit a review for a lawyer.
    POST /api/reviews/submit_review/
    
    Validation: Only clients with completed appointments or cases can rate a lawyer
    Required: lawyer_id, comment, rating, and either appointment_id OR case_id
    """
    permission_classes = [IsAuthenticated]

    def _has_completed_interaction(self, client, lawyer):
        """
        Check if client has any completed appointments or cases with the lawyer.
        """
        completed_appointment = Appointment.objects.filter(
            consultation__client=client,
            consultation__lawyer=lawyer,
            status=Appointment.STATUS_COMPLETED
        ).exists()
        
        if completed_appointment:
            return True
        
        completed_case = Case.objects.filter(
            client=client,
            lawyer=lawyer,
            status='completed'
        ).exists()
        
        return completed_case

    def post(self, request):
        lawyer_id = request.data.get('lawyer_id')
        comment = request.data.get('comment')
        rating = request.data.get('rating')
        appointment_id = request.data.get('appointment_id')
        case_id = request.data.get('case_id')

        # Validate required fields (Allowing empty comment)
        print(f"DEBUG: SubmitReviewView - lawyer_id: {lawyer_id}, rating: {rating}, appointment_id: {appointment_id}, case_id: {case_id}")
        if not lawyer_id or rating is None:
            print("DEBUG: Missing lawyer_id or rating")
            return Response(
                {'error': 'lawyer_id and rating are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Must have either appointment_id or case_id
        if not appointment_id and not case_id:
            return Response(
                {'error': 'Either appointment_id or case_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate rating is between 1 and 5
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return Response(
                    {'error': 'Rating must be between 1 and 5'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Rating must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if lawyer exists
        try:
            lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Lawyer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate that client has completed interaction with lawyer
        if not self._has_completed_interaction(request.user, lawyer):
            return Response(
                {
                    'error': 'You can only rate lawyers after completing a consultation or case with them.',
                    'can_rate': False
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has already reviewed this SPECIFIC interaction
        existing_review = None
        if appointment_id:
            existing_review = Review.objects.filter(client=request.user, appointment_id=appointment_id).first()
        elif case_id:
            existing_review = Review.objects.filter(client=request.user, case_id=case_id).first()
        
        if existing_review:
            print(f"DEBUG: Existing review found for user {request.user.id}: {existing_review.id}")
            return Response(
                {
                    'error': 'You have already reviewed this specific appointment or case.',
                    'already_reviewed': True
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate appointment exists if provided
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(
                    id=appointment_id,
                    consultation__client=request.user,
                    consultation__lawyer=lawyer,
                    status=Appointment.STATUS_COMPLETED
                )
            except Appointment.DoesNotExist:
                return Response(
                    {'error': 'Appointment not found or not completed'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Validate case exists if provided
        case = None
        if case_id:
            try:
                case = Case.objects.get(
                    id=case_id,
                    client=request.user,
                    lawyer=lawyer,
                    status='completed'
                )
            except Case.DoesNotExist:
                return Response(
                    {'error': 'Case not found or not completed'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Create new review linked to appointment or case
        try:
            review = Review.objects.create(
                client=request.user,
                lawyer=lawyer,
                comment=comment or "",
                rating=rating,
                appointment=appointment,
                case=case
            )
            print(f"DEBUG: Created review {review.id}")
        except Exception as e:
            print(f"DEBUG: Failed to create review: {str(e)}")
            return Response(
                {'error': f'Failed to create review: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Notify the lawyer about the new rating
        try:
            from notification.utils import send_notification

            star_text = "⭐" * rating
            review_source = f"case '{case.case_title}'" if case else "a consultation appointment"
            send_notification(
                user=lawyer,
                title="New Rating Received",
                message=f"{request.user.name} rated you {rating}/5 {star_text} for {review_source}.",
                notif_type="system",
                link="/lawyerdashboard",
            )
        except Exception:
            # Notification should never break the review flow
            pass

        serializer = ReviewSerializer(review, context={'request': request})
        return Response(
            {
                'message': 'Review submitted successfully',
                'review': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class CanRateLawyerView(APIView):
    """
    Check if the current user can rate a specific lawyer.
    GET /api/reviews/can-rate/?lawyer_id=1
    
    Returns:
    - can_rate: Boolean indicating if user can rate
    - reason: Explanation if user cannot rate
    - has_completed_consultation: Boolean
    - has_completed_case: Boolean
    """
    permission_classes = [IsAuthenticated]

    def _has_completed_interaction(self, client, lawyer):
        """
        Check if client has any completed appointments or cases with the lawyer.
        Rating is allowed AFTER appointment is completed, not just after consultation is accepted.
        """
        # Check for completed appointments (linked via consultation)
        # This is the PRIMARY way clients rate - after their scheduled appointment is done
        completed_appointment = Appointment.objects.filter(
            consultation__client=client,
            consultation__lawyer=lawyer,
            status=Appointment.STATUS_COMPLETED
        ).exists()
        
        if completed_appointment:
            return True, 'completed_appointment'
        
        # Also allow rating if they completed a case with the lawyer
        completed_case = Case.objects.filter(
            client=client,
            lawyer=lawyer,
            status='completed'
        ).exists()
        
        if completed_case:
            return True, 'completed_case'
        
        return False, None

    def get(self, request):
        lawyer_id = request.query_params.get('lawyer_id')

        if not lawyer_id:
            return Response(
                {'error': 'lawyer_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Lawyer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        can_rate, reason = self._has_completed_interaction(request.user, lawyer)
        
        # Check if user has already reviewed this lawyer
        existing_review = Review.objects.filter(
            client=request.user,
            lawyer=lawyer
        ).exists()

        response_data = {
            'can_rate': can_rate and not existing_review,
            'reason': reason,
            'has_already_reviewed': existing_review,
            'message': (
                'You have already reviewed this lawyer' 
                if existing_review and can_rate 
                else 'You can only rate lawyers after completing a consultation or case with them'
                if not can_rate
                else 'You can rate this lawyer'
            )
        }

        return Response(response_data, status=status.HTTP_200_OK)

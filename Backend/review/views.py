from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewSerializer, LawyerReviewSummarySerializer
from authentication.models import User
from consultation.models import Consultation
from case.models import Case


class ReviewListCreateView(generics.ListCreateAPIView):
    """
    List all reviews or create a new one.
    GET /api/reviews/
    POST /api/reviews/
    
    POST Validation: Only clients with completed consultations or cases can rate a lawyer
    """
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
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
        Check if client has any completed consultations or cases with the lawyer
        """
        # Check for completed consultations
        completed_consultation = Consultation.objects.filter(
            client=client,
            lawyer=lawyer,
            status=Consultation.STATUS_COMPLETED
        ).exists()
        
        if completed_consultation:
            return True
        
        # Check for completed cases
        completed_case = Case.objects.filter(
            client=client,
            lawyer=lawyer,
            status='completed'
        ).exists()
        
        return completed_case

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise PermissionError("You must be authenticated to leave a review")
        
        # Get lawyer_id from request data
        lawyer_id = self.request.data.get('lawyer_id')
        
        if not lawyer_id:
            raise ValueError("lawyer_id is required")
        
        try:
            lawyer = User.objects.get(id=lawyer_id, is_lawyer=True)
        except User.DoesNotExist:
            raise ValueError("Lawyer not found")
        
        # Validate that client has completed interaction with lawyer
        if not self._has_completed_interaction(self.request.user, lawyer):
            raise PermissionError(
                "You can only rate lawyers after completing a consultation or case with them"
            )
        
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
    Get review summary for a specific lawyer.
    GET /api/reviews/lawyer_summary/?lawyer_id=1
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

        # Calculate statistics
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        total_reviews = reviews.count()

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
            'recent_reviews': ReviewSerializer(recent, many=True).data
        }

        return Response(summary, status=status.HTTP_200_OK)


class TopLawyersView(APIView):
    """
    Get top-rated lawyers.
    GET /api/reviews/top_lawyers/?limit=10
    """
    permission_classes = [AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))

        top_lawyers = User.objects.filter(is_lawyer=True).annotate(
            avg_rating=Avg('reviews_received__rating'),
            review_count=Count('reviews_received')
        ).filter(review_count__gt=0).order_by('-avg_rating')[:limit]

        data = [
            {
                'id': lawyer.id,
                'name': lawyer.name,
                'specialization': lawyer.lawyer_kyc.specializations if hasattr(lawyer, 'lawyer_kyc') else [],
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
    
    Validation: Only clients with completed consultations or cases can rate a lawyer
    """
    permission_classes = [IsAuthenticated]

    def _has_completed_interaction(self, client, lawyer):
        """
        Check if client has any completed consultations or cases with the lawyer
        """
        # Check for completed consultations
        completed_consultation = Consultation.objects.filter(
            client=client,
            lawyer=lawyer,
            status=Consultation.STATUS_COMPLETED
        ).exists()
        
        if completed_consultation:
            return True
        
        # Check for completed cases
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
        title = request.data.get('title', '')

        if not all([lawyer_id, comment, rating]):
            return Response(
                {'error': 'lawyer_id, comment, and rating are required'},
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
                    'error': 'You can only rate lawyers after completing a consultation or case with them'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        review_data = {
            'client': request.user.id,
            'lawyer': lawyer.id,
            'comment': comment,
            'rating': rating,
            'title': title,
        }

        serializer = ReviewSerializer(data=review_data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Review submitted successfully', 'review': serializer.data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

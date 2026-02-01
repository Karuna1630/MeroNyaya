from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count, Q
from .models import Review
from .serializers import ReviewSerializer, LawyerReviewSummarySerializer
from authentication.models import User


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Filter reviews based on query parameters
        """
        queryset = Review.objects.all()
        
        lawyer_id = self.request.query_params.get('lawyer_id', None)
        client_id = self.request.query_params.get('client_id', None)
        
        if lawyer_id:
            queryset = queryset.filter(lawyer_id=lawyer_id)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """
        Set client to current user when creating review
        """
        if self.request.user.is_authenticated:
            serializer.save(client=self.request.user)
        else:
            raise PermissionError("You must be authenticated to leave a review")
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def lawyer_summary(self, request):
        """
        Get review summary for a specific lawyer
        GET /api/reviews/lawyer_summary/?lawyer_id=1
        """
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
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def top_lawyers(self, request):
        """
        Get top-rated lawyers
        GET /api/reviews/top_lawyers/?limit=10
        """
        limit = int(request.query_params.get('limit', 10))
        
        # Get lawyers with their average rating
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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_review(self, request):
        """
        Submit a review for a lawyer
        POST /api/reviews/submit_review/
        """
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

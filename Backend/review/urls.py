from django.urls import path
from .views import (
    ReviewListCreateView,
    ReviewDetailView,
    LawyerReviewSummaryView,
    TopLawyersView,
    SubmitReviewView,
    CanRateLawyerView,
)

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list'),
    path('lawyer_summary/', LawyerReviewSummaryView.as_view(), name='review-lawyer-summary'),
    path('top_lawyers/', TopLawyersView.as_view(), name='review-top-lawyers'),
    path('submit_review/', SubmitReviewView.as_view(), name='review-submit-review'),
    path('can-rate/', CanRateLawyerView.as_view(), name='review-can-rate'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]

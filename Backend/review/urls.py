from django.urls import path
from .views import (
    ReviewListCreateView,
    ReviewDetailView,
    LawyerReviewSummaryView,
    TopLawyersView,
    SubmitReviewView,
)

urlpatterns = [
    path('', ReviewListCreateView.as_view(), name='review-list'),
    path('lawyer_summary/', LawyerReviewSummaryView.as_view(), name='review-lawyer-summary'),
    path('top_lawyers/', TopLawyersView.as_view(), name='review-top-lawyers'),
    path('submit_review/', SubmitReviewView.as_view(), name='review-submit-review'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]

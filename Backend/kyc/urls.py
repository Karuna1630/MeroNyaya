from django.urls import path
from .views import (
    SubmitKYCView,
    MyKYCView,
    UpdateKYCView,
    KYCStatusView,
    AdminKYCListView,
    AdminKYCDetailView,
    AdminKYCReviewView
)

urlpatterns = [
    # Lawyer endpoints
    path('submit/', SubmitKYCView.as_view(), name='kyc-submit'),
    path('my-kyc/', MyKYCView.as_view(), name='my-kyc'),
    path('update/', UpdateKYCView.as_view(), name='kyc-update'),
    path('status/', KYCStatusView.as_view(), name='kyc-status'),
    
    # Admin endpoints
    path('admin/list/', AdminKYCListView.as_view(), name='admin-kyc-list'),
    path('admin/detail/<int:id>/', AdminKYCDetailView.as_view(), name='admin-kyc-detail'),
    path('admin/review/<int:id>/', AdminKYCReviewView.as_view(), name='admin-kyc-review'),
]

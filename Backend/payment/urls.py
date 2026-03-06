from django.urls import path
from .views import (
    EsewaInitiateView,
    EsewaVerifyView,
    PaymentListView,
    PaymentDetailView,
    LawyerEarningsView,
    AdminRevenueView,
    AdminCreatePayoutView,
    AdminLawyerPendingPaymentsView,
)

urlpatterns = [
    path("esewa/initiate/", EsewaInitiateView.as_view(), name="esewa-initiate"),
    path("esewa/verify/", EsewaVerifyView.as_view(), name="esewa-verify"),
    path("earnings/", LawyerEarningsView.as_view(), name="lawyer-earnings"),
    path("admin/revenue/", AdminRevenueView.as_view(), name="admin-revenue"),
    path("admin/payout/", AdminCreatePayoutView.as_view(), name="admin-create-payout"),
    path("admin/pending/<int:lawyer_id>/", AdminLawyerPendingPaymentsView.as_view(), name="admin-lawyer-pending"),
    path("", PaymentListView.as_view(), name="payment-list"),
    path("<int:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
]

from django.urls import path
from .views import (
    EsewaInitiateView,
    EsewaVerifyView,
    KhaltiInitiateView,
    KhaltiVerifyView,
    PaymentListView,
    PaymentDetailView,
    LawyerEarningsView,
    AdminRevenueView,
    AdminCreatePayoutView,
    AdminLawyerPendingPaymentsView,
    CreateCasePaymentRequestView,
    RespondToCasePaymentView,
    CasePaymentRequestDetailView,
    CasePaymentRequestListView,
    EsewaInitiateCasePaymentView,
    EsewaVerifyCasePaymentView,
    KhaltiInitiateCasePaymentView,
    KhaltiVerifyCasePaymentView,
)

urlpatterns = [
    path("esewa/initiate/", EsewaInitiateView.as_view(), name="esewa-initiate"),
    path("esewa/verify/", EsewaVerifyView.as_view(), name="esewa-verify"),
    path("esewa/verify-case/", EsewaVerifyCasePaymentView.as_view(), name="esewa-verify-case"),
    path("khalti/initiate/", KhaltiInitiateView.as_view(), name="khalti-initiate"),
    path("khalti/verify/", KhaltiVerifyView.as_view(), name="khalti-verify"),
    path("khalti/verify-case/", KhaltiVerifyCasePaymentView.as_view(), name="khalti-verify-case"),
    path("earnings/", LawyerEarningsView.as_view(), name="lawyer-earnings"),
    path("admin/revenue/", AdminRevenueView.as_view(), name="admin-revenue"),
    path("admin/payout/", AdminCreatePayoutView.as_view(), name="admin-create-payout"),
    path("admin/pending/<int:lawyer_id>/", AdminLawyerPendingPaymentsView.as_view(), name="admin-lawyer-pending"),
    # Case payment request endpoints
    path("cases/request/", CreateCasePaymentRequestView.as_view(), name="create-case-payment-request"),
    path("cases/<uuid:payment_request_id>/", CasePaymentRequestDetailView.as_view(), name="case-payment-request-detail"),
    path("cases/<uuid:payment_request_id>/respond/", RespondToCasePaymentView.as_view(), name="respond-to-case-payment"),
    path("cases/<int:case_id>/requests/", CasePaymentRequestListView.as_view(), name="case-payment-request-list"),
    # Case payment - payment gateway endpoints
    path("cases/esewa/initiate/", EsewaInitiateCasePaymentView.as_view(), name="esewa-initiate-case"),
    path("cases/khalti/initiate/", KhaltiInitiateCasePaymentView.as_view(), name="khalti-initiate-case"),
    # Regular appointment payment endpoints
    path("", PaymentListView.as_view(), name="payment-list"),
    path("<int:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
]

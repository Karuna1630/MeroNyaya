from django.urls import path
from .views import (
    # Case views
    CaseListCreateView,
    CaseDetailView,
    PublicCasesView,
    CaseUploadDocumentsView,
    CaseActionView,
    CaseDocumentDownloadView,
    # Case Appointment views
    CaseAppointmentListCreateView,
    CaseAppointmentActionView,
)

urlpatterns = [
    # Case Appointments
    path('appointments/', CaseAppointmentListCreateView.as_view(), name='case-appointment-list'),
    path('appointments/<int:pk>/<str:action>/', CaseAppointmentActionView.as_view(), name='case-appointment-action'),

    # Document download proxy
    path('documents/<int:pk>/download/', CaseDocumentDownloadView.as_view(), name='case-document-download'),

    # Cases
    path('', CaseListCreateView.as_view(), name='case-list'),
    path('public_cases/', PublicCasesView.as_view(), name='case-public-cases'),
    path('<int:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('<int:pk>/upload_documents/', CaseUploadDocumentsView.as_view(), name='case-upload-documents'),
    path('<int:pk>/<str:action>/', CaseActionView.as_view(), name='case-actions'),
]

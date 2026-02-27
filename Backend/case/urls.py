from django.urls import path
from .views import CaseViewSet, CaseAppointmentViewSet

urlpatterns = [
    # Case Appointments
    path('appointments/', CaseAppointmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='case-appointment-list'),
    path('appointments/<int:pk>/', CaseAppointmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='case-appointment-detail'),
    path('appointments/<int:pk>/confirm/', CaseAppointmentViewSet.as_view({'post': 'confirm'}), name='case-appointment-confirm'),
    path('appointments/<int:pk>/reject/', CaseAppointmentViewSet.as_view({'post': 'reject'}), name='case-appointment-reject'),
    path('appointments/<int:pk>/complete/', CaseAppointmentViewSet.as_view({'post': 'complete'}), name='case-appointment-complete'),

    # Cases
    path('', CaseViewSet.as_view({'get': 'list', 'post': 'create'}), name='case-list'),
    path('public_cases/', CaseViewSet.as_view({'get': 'public_cases'}), name='case-public-cases'),
    path('<int:pk>/', CaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='case-detail'),
    path('<int:pk>/upload_documents/', CaseViewSet.as_view({'post': 'upload_documents', 'patch': 'upload_documents'}), name='case-upload-documents'),
    path('<int:pk>/accept_case/', CaseViewSet.as_view({'post': 'accept_case'}), name='case-accept-case'),
    path('<int:pk>/update_status/', CaseViewSet.as_view({'patch': 'update_status'}), name='case-update-status'),
    path('<int:pk>/update_case_details/', CaseViewSet.as_view({'patch': 'update_case_details'}), name='case-update-details'),
    path('<int:pk>/add_timeline_event/', CaseViewSet.as_view({'post': 'add_timeline_event'}), name='case-timeline-event'),
    path('<int:pk>/schedule_meeting/', CaseViewSet.as_view({'post': 'schedule_meeting'}), name='case-schedule-meeting'),
]

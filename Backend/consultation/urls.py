from django.urls import path
from .views import (
    ConsultationListCreateView,
    ConsultationDetailView,
    ConsultationAcceptView,
    ConsultationRejectView,
    ConsultationCompleteView,
)

urlpatterns = [
    path("", ConsultationListCreateView.as_view(), name="consultation-list"),
    path("<int:pk>/", ConsultationDetailView.as_view(), name="consultation-detail"),
    path("<int:pk>/accept/", ConsultationAcceptView.as_view(), name="consultation-accept"),
    path("<int:pk>/reject/", ConsultationRejectView.as_view(), name="consultation-reject"),
    path("<int:pk>/complete/", ConsultationCompleteView.as_view(), name="consultation-complete"),
]

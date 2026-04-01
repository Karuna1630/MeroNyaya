from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentPayView,
)

urlpatterns = [
    path("", AppointmentListCreateView.as_view(), name="appointment-list"),
    path("<int:pk>/", AppointmentDetailView.as_view(), name="appointment-detail"),
    path("<int:pk>/pay/", AppointmentPayView.as_view(), name="appointment-pay"),
]

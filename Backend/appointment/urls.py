from django.urls import path
from .views import AppointmentViewSet

urlpatterns = [
    path("", AppointmentViewSet.as_view({'get': 'list', 'post': 'create'}), name="appointment-list"),
    path("<int:pk>/", AppointmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="appointment-detail"),
    path("<int:pk>/pay/", AppointmentViewSet.as_view({'post': 'pay'}), name="appointment-pay"),
]

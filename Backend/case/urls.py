from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet, CaseAppointmentViewSet

router = DefaultRouter()
router.register(r'', CaseViewSet, basename='case')

# Separate router for case appointments
appointment_router = DefaultRouter()
appointment_router.register(r'appointments', CaseAppointmentViewSet, basename='case-appointment')

urlpatterns = [
    path('', include(appointment_router.urls)),
    path('', include(router.urls)),
]

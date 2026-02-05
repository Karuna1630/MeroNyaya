from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet, CaseAppointmentViewSet

router = DefaultRouter()
router.register(r'', CaseViewSet, basename='case')
router.register(r'appointments', CaseAppointmentViewSet, basename='case-appointment')

urlpatterns = [
    path('', include(router.urls)),
]

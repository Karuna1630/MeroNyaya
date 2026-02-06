from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet, CaseAppointmentViewSet

router = DefaultRouter()
# Register more specific prefixes first to avoid being captured by the empty prefix detail route.
router.register(r'appointments', CaseAppointmentViewSet, basename='case-appointment')
router.register(r'', CaseViewSet, basename='case')

urlpatterns = [
    path('', include(router.urls)),
]

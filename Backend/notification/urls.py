from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet


# Register viewset with the router — same pattern as other apps
router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]

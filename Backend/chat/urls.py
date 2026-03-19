from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet

# Create router for ViewSet
router = DefaultRouter()
router.register('conversations', ConversationViewSet, basename='conversation')

# URL patterns
urlpatterns = router.urls

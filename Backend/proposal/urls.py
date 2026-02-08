from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProposalViewSet


# Create a router and register our viewsets with it. The router will automatically generate the URL conf for our API.
router = DefaultRouter()
# Register more specific prefixes first to avoid being captured by the empty prefix detail route.
router.register(r'', ProposalViewSet, basename='proposal')

urlpatterns = [
    path('', include(router.urls)),
]

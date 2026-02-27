from django.urls import path
from .views import ConsultationViewSet

urlpatterns = [
    path("", ConsultationViewSet.as_view({'get': 'list', 'post': 'create'}), name="consultation-list"),
    path("<int:pk>/", ConsultationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name="consultation-detail"),
    path("<int:pk>/accept/", ConsultationViewSet.as_view({'post': 'accept'}), name="consultation-accept"),
    path("<int:pk>/reject/", ConsultationViewSet.as_view({'post': 'reject'}), name="consultation-reject"),
    path("<int:pk>/complete/", ConsultationViewSet.as_view({'post': 'complete'}), name="consultation-complete"),
]

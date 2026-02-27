from django.urls import path
from .views import ProposalViewSet

urlpatterns = [
    path('', ProposalViewSet.as_view({'get': 'list', 'post': 'create'}), name='proposal-list'),
    path('<int:pk>/', ProposalViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='proposal-detail'),
    path('<int:pk>/accept/', ProposalViewSet.as_view({'post': 'accept'}), name='proposal-accept'),
    path('<int:pk>/reject/', ProposalViewSet.as_view({'post': 'reject'}), name='proposal-reject'),
    path('<int:pk>/withdraw/', ProposalViewSet.as_view({'post': 'withdraw'}), name='proposal-withdraw'),
]

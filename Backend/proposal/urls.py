from django.urls import path
from .views import (
    ProposalListCreateView,
    ProposalDetailView,
    ProposalAcceptView,
    ProposalRejectView,
    ProposalWithdrawView,
)

urlpatterns = [
    path('', ProposalListCreateView.as_view(), name='proposal-list'),
    path('<int:pk>/', ProposalDetailView.as_view(), name='proposal-detail'),
    path('<int:pk>/accept/', ProposalAcceptView.as_view(), name='proposal-accept'),
    path('<int:pk>/reject/', ProposalRejectView.as_view(), name='proposal-reject'),
    path('<int:pk>/withdraw/', ProposalWithdrawView.as_view(), name='proposal-withdraw'),
]

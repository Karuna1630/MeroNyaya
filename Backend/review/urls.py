from django.urls import path
from .views import ReviewViewSet

urlpatterns = [
    path('', ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='review-list'),
    path('lawyer_summary/', ReviewViewSet.as_view({'get': 'lawyer_summary'}), name='review-lawyer-summary'),
    path('top_lawyers/', ReviewViewSet.as_view({'get': 'top_lawyers'}), name='review-top-lawyers'),
    path('submit_review/', ReviewViewSet.as_view({'post': 'submit_review'}), name='review-submit-review'),
    path('<int:pk>/', ReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='review-detail'),
]

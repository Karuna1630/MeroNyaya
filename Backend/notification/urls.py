from django.urls import path
from .views import NotificationViewSet

urlpatterns = [
    path('', NotificationViewSet.as_view({'get': 'list'}), name='notification-list'),
    path('read_all/', NotificationViewSet.as_view({'patch': 'read_all'}), name='notification-read-all'),
    path('unread_count/', NotificationViewSet.as_view({'get': 'unread_count'}), name='notification-unread-count'),
    path('<int:pk>/', NotificationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='notification-detail'),
    path('<int:pk>/read/', NotificationViewSet.as_view({'patch': 'read'}), name='notification-read'),
]

from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    NotificationReadView,
    NotificationReadAllView,
    NotificationUnreadCountView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('read_all/', NotificationReadAllView.as_view(), name='notification-read-all'),
    path('unread_count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
]

from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    List all notifications for the authenticated user.
    GET /api/notifications/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()

        return Notification.objects.filter(
            user=user
        ).order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific notification.
    GET/PATCH/DELETE /api/notifications/<pk>/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()

        return Notification.objects.filter(user=user)


class NotificationReadView(APIView):
    """
    Mark a single notification as read.
    PATCH /api/notifications/<pk>/read/
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {'detail': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.mark_as_read()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)


class NotificationReadAllView(APIView):
    """
    Mark all notifications as read for the current user.
    PATCH /api/notifications/read_all/
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({'detail': 'All notifications marked as read'})


class NotificationUnreadCountView(APIView):
    """
    Return the count of unread notifications for the current user.
    GET /api/notifications/unread_count/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response({'unread_count': count})

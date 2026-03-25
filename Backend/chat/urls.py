from django.urls import path
from . import views

urlpatterns = [
    # List all conversations (grouped by user)
    path('conversations/', views.conversation_list, name='conversation-list'),

    # GET: Get messages with user | POST: Send message to user
    path('conversations/<int:user_id>/messages/', views.messages, name='messages'),
]

from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterUserView.as_view(), name="register"),
    path("login/", views.LoginUserView.as_view(), name="login"),
    path("get-user/", views.GetUserView.as_view(), name="get-user"),
    path("get-user/<int:pk>/", views.UserDetailView.as_view(), name="get-user-detail"),
 
]
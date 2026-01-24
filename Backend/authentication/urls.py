from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

# URL patterns for authentication app
urlpatterns = [
    path("register/", views.RegisterUserView.as_view(), name="register"),
    path("login/", views.LoginUserView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("get-user/", views.GetUserView.as_view(), name="get-user"),
    path("get-user/<int:pk>/", views.UserDetailView.as_view(), name="get-user-detail"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", views.ResendOTPView.as_view(), name="resend-otp"),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("profile/", views.UserProfileView.as_view(), name="user-profile"),
]
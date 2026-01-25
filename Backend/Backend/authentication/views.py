from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .permissions import IsSuperUser
from django.contrib.auth import authenticate
from django.db import transaction

from meronaya.resonses import api_response
from .otp import verify_otp, resend_otp
from .serializers import (
    UserResponseSerializer,
    RegisterUserSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginUserSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


# View to register a new user
class RegisterUserView(generics.CreateAPIView):
   permission_classes = [AllowAny]
   serializer_class = RegisterUserSerializer

   @transaction.atomic
   def perform_create(self, serializer):
       user = serializer.save()
       return user
   # Swagger documentation for the register endpoint
   @swagger_auto_schema(
       operation_description="Register a new user.",
       request_body=RegisterUserSerializer,
       responses={
           201: openapi.Response(description="User registered successfully."),
           400: openapi.Response(description="Bad request."),
           500: openapi.Response(description="Internal server error."),
       },
       tags=["User"],
   )
   
    # post method to handle user registration
   def post(self, request):
        try:
           serializer = self.get_serializer(data=request.data)
           if serializer.is_valid():
                user= self.perform_create(serializer)
                # Store email in session for OTP verification
                request.session['otp_email'] = user.email
                request.session.set_expiry(1800) 
                return api_response(
                   is_success=True,
                   status_code=status.HTTP_201_CREATED,
                     result={
                         "message": "User registered successfully.Please Verify OTP",
                         
                         },
               )
           return api_response(
               is_success=False,
               error_message=serializer.errors,
               status_code=status.HTTP_400_BAD_REQUEST,
               result={
                   "message": "User registration failed.",
               }
           )
        except Exception as e:
           return api_response(
               is_success=False,
               error_message=str(e),
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           )
        
# View for verifying OTP
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer

    @swagger_auto_schema(
        operation_description="Verify OTP for email verification.",
        request_body=VerifyOTPSerializer,
        responses={
            200: openapi.Response(description="OTP verified successfully."),
            400: openapi.Response(description="Invalid or expired OTP"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["OTP"],
    )
    # post method to handle OTP verification
    def post(self, request):
        try:
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                 return api_response(
                    is_success=False,  
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validate OTP input format
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            is_valid, message = verify_otp(email, otp)
            
            if is_valid:
                    return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={"message": "OTP verified successfully. You can now log in."}
                )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": message},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# View for resending OTP
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Resend OTP to user email",
        request_body=ResendOTPSerializer,
        responses={
            200: openapi.Response(description="OTP resent successfully"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
            },
        tags=["OTP"]
    )
    # Created post method for resending OTP
    def post(self, request):
        try:
            serializer = ResendOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            email = serializer.validated_data['email']
            
            result, message = resend_otp(email)

            if result:
                request.session['otp_email'] = email
                request.session.set_expiry(1800)
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={"message": "OTP has been resent to your email."}
                )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": message},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# View for Resetting Password
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Reset user password after OTP verification",
        request_body=ResetPasswordSerializer,
        responses={
            200: openapi.Response(description="Password reset successful"),
            400: openapi.Response(description="Bad Request"),
            404: openapi.Response(description="User not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

    # Created post method for resetting password
    def post(self, request):
        try:
            serializer = ResetPasswordSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            email = request.session.get("reset_email") or request.data.get("email")
            if not email:
                return api_response(
                    is_success=False,
                    error_message="OTP verification required before resetting password.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message="User not found.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            user.set_password(serializer.validated_data["new_password"])
            user.save()

            if "reset_email" in request.session:
                del request.session["reset_email"]

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"message": "Password reset successfully."},
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# View to handle user login and JWT token generation   
class LoginUserView(TokenObtainPairView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    serializer_class = LoginUserSerializer

    @swagger_auto_schema(
        operation_description="User login to obtain JWT tokens.",
        request_body= LoginUserSerializer,
        responses={
            200: openapi.Response(description="Login successful."),
            400: openapi.Response(description="Bad request."),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["User"],
    )

    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
               email = serializer.validated_data['email']
               password = serializer.validated_data['password']
               user = authenticate(request, email=email, password=password)

               if user is not None:
                  user_data = UserResponseSerializer(user, context={'request': request}).data
                  refresh = RefreshToken.for_user(user)
                  refresh_token = str(refresh)
                  access_token = str(refresh.access_token)

                  return api_response(
                        is_success=True,
                        status_code=status.HTTP_200_OK,
                        result={
                            "message": "Login successful.",
                            "user": user_data,
                            "refresh_token": refresh_token,
                            "access_token": access_token,
                        },
                    )
               else:
                   return api_response(
                       is_success=False,
                       error_message="Invalid email or password.",
                       status_code=status.HTTP_401_UNAUTHORIZED,
                    )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message="An error occurred during login.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
# View to retrieve list of all users
class GetUserView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserResponseSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperUser]

    @swagger_auto_schema(
        operation_description="Retrieve list of all users.",
        responses={
            200: openapi.Response(
                description="List of users retrieved successfully.",
                schema=UserResponseSerializer(many=True)
            ),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["User"],
    )
    # get method to handle retrieving all users
    def get(self, request, *args, **kwargs):
        try:
            users = self.get_queryset()
            serializer = self.get_serializer(users, many=True)

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "count": users.count(),
                    "users": serializer.data,
                }
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
# View to retrieve details of a specific user by ID
class UserDetailView(generics.RetrieveAPIView):
   queryset = User.objects.all()
   serializer_class = UserResponseSerializer
   authentication_classes = [JWTAuthentication]
   permission_classes = [IsAuthenticated]

   @swagger_auto_schema(
       operation_description="Retrieve details of a specific user by ID.",
       responses={
           200: openapi.Response(description="User details retrieved successfully.", schema=UserResponseSerializer),
           404: openapi.Response(description="User not found."),
           500: openapi.Response(description="Internal server error."),
       },
       tags=["User"],
   )
    # get method to handle retrieving user details by ID
   def get(self, request, *args, **kwargs):
       try:
           user = self.get_object()
           serializer = self.get_serializer(user)
           return api_response(
               is_success=True,
               status_code=status.HTTP_200_OK,
               result=serializer.data
           )
       except Exception as e:
           return api_response(
               is_success=False,
               error_message=str(e),
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           )

# View to retrieve and update user profile
class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @swagger_auto_schema(
        operation_description="Retrieve the current user's profile information.",
        responses={
            200: openapi.Response(description="Profile retrieved successfully.", schema=UserProfileSerializer),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Profile"],
    )
    # get method to retrieve user profile
    def get(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result=serializer.data
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_description="Update the current user's profile information.",
        request_body=UserProfileSerializer,
        responses={
            200: openapi.Response(description="Profile updated successfully.", schema=UserProfileSerializer),
            400: openapi.Response(description="Bad request."),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Profile"],
    )
    # put method to update user profile (full update)
    def put(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user, data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Profile updated successfully.",
                        "user": serializer.data
                    }
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_description="Partially update the current user's profile information.",
        request_body=UserProfileSerializer,
        responses={
            200: openapi.Response(description="Profile updated successfully.", schema=UserProfileSerializer),
            400: openapi.Response(description="Bad request."),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Profile"],
    )
    # patch method to partially update user profile
    def patch(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Profile updated successfully.",
                        "user": serializer.data
                    }
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    

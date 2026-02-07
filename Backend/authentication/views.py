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


# Creating API view for user registration which allows new users to sign up by providing their email, password, and other optional details. 
class RegisterUserView(generics.CreateAPIView):
   # providing permission to allow any users for access
   permission_classes = [AllowAny]
   # specifying the serializer class to handle user registration data validation and serialization.
   serializer_class = RegisterUserSerializer

    #using transation.atomic to ensure that if any part is fails during the user creation process, the entire transaction will be rolled back to maintain data integrity.
   @transaction.atomic
   def perform_create(self, serializer):
       user = serializer.save()
       return user
   # creating swagger documentation for the user registration endpoint
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
   
    # Creating post method to handle user registration requests.
   def post(self, request):
        try:
           # valdiating the incoming request data using the specified serializer and if the data is valid, creating a new user
           serializer = self.get_serializer(data=request.data)
           if serializer.is_valid():
                user= self.perform_create(serializer)
                # Storing the user email in the session for otp verification and setting the session expiry time
                request.session['otp_email'] = user.email
                request.session.set_expiry(1800) 
                return api_response(
                   is_success=True,
                   status_code=status.HTTP_201_CREATED,
                     result={
                         "message": "User registered successfully.Please Verify OTP",
                         
                         },
               )
           # if the serializer is not valid then return the error messages with bad request status code
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
        
# Creating API view for verifying OTP which allows users to verify the OTP sent to their email for account verification.
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
    # Creating post method to handle OTP verification requests.
    def post(self, request):
        try:
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                 return api_response(
                    is_success=False,  
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            # valdiating the incoming request data using the specified serializer 
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            # Extracting email and otp from the validated data
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

#  Creating API view for resending OTP which allows users to request a new OTP to be sent to their email.
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

# Creating API view for resetting password which allows users to reset their password after OTP verification.
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    # Creating swagger documentation for the reset password endpoint
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

    # Creating post method for resetting password
    def post(self, request):
        try:
            # Validating the incoming request data using the specified serializer and if the data is valid, resetting the user's password
            serializer = ResetPasswordSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            # Extracting email from the session or request data to identify the user whose password is being reset. This ensures that only the user who has verified their OTP can reset their password.
            email = request.session.get("reset_email") or request.data.get("email")
            if not email:
                return api_response(
                    is_success=False,
                    error_message="OTP verification required before resetting password.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Extracting new password and confirm password from the validated data
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message="User not found.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )
            # Checking if new password and confirm password match
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            # Clearing the reset email from the session after successful password reset to prevent unauthorized access to the password reset functionality.
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

# Creating API view for handling user login and JWT token generation   
class LoginUserView(TokenObtainPairView):
    permission_classes = [AllowAny]
    # Specifying the authentication class to use JSON Web Token (JWT) authentication for this view 
    authentication_classes = [JWTAuthentication]
    serializer_class = LoginUserSerializer

    # Creating swagger documentation for the user login endpoint
    @swagger_auto_schema(
        operation_description="User login to obtain JWT tokens.",
        request_body= LoginUserSerializer,
        responses={
            200: openapi.Response(description="Login successful."),
            400: openapi.Response(description="Bad request."),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        # Adding tags for better organization in Swagger UI
        tags=["User"],
    )

    # Creating post method to handle user login requests and generate JWT tokens upon successful authentication. 
    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            # Validating the incoming request data using the specified serializer and if the data is valid, authenticating the user and generating JWT tokens for authenticated sessions.
            if serializer.is_valid():
               email = serializer.validated_data['email']
               password = serializer.validated_data['password']
               user = authenticate(request, email=email, password=password)

               if user is not None:
                  # Serializing the authenticated user's data to include in the response
                  user_data = UserResponseSerializer(user, context={'request': request}).data
                  refresh = RefreshToken.for_user(user)
                  refresh_token = str(refresh)
                  access_token = str(refresh.access_token)

                # if authentication is successful, return the user data along with the generated JWT tokens in the response with a success message and status code 200 OK.                
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
               # If authentication fails, return an error response indicating invalid email or password with unauthorized status code.
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
        
# Creating API view for retrieving list of all users
class GetUserView(generics.ListAPIView):
    # Specifying the queryset to retrieve all users 
    queryset = User.objects.all()
    serializer_class = UserResponseSerializer
    authentication_classes = [JWTAuthentication]
    # Restricting access to this view to only superusers
    permission_classes = [IsSuperUser]

    # Creating swagger documentation for the get users endpoint
    @swagger_auto_schema(
        operation_description="Retrieve list of all users.",
        responses={
            200: openapi.Response(
                description="List of users retrieved successfully.",
                schema=UserResponseSerializer(many=True)
            ),
            500: openapi.Response(description="Internal server error."),
        },
        # creating tags for better organization in Swagger UI
        tags=["User"],
    )
    # Creating get method to handle retrieving list of all users 
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
        
# Creating API view to retrieve details of a specific user by ID
class UserDetailView(generics.RetrieveAPIView):
   # Specifiying the queryset to retrieve all user details
   queryset = User.objects.all()
   serializer_class = UserResponseSerializer
   authentication_classes = [JWTAuthentication]
   # Restricting access to this view to only authenticated users
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

# Creating API view to retrieve and update user profile
class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    # Restricting access to this view to only authenticated users
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    # Creating swagger documentation for the user profile endpoint
    @swagger_auto_schema(
        operation_description="Retrieve the current user's profile information.",
        responses={
            200: openapi.Response(description="Profile retrieved successfully.", schema=UserProfileSerializer),
            401: openapi.Response(description="Unauthorized."),
            500: openapi.Response(description="Internal server error."),
        },
        tags=["Profile"],
    )
    # Creating get method to handle retrieving the current user's profile information. This allows authenticated users to view their own profile details.
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
    # Creating put method to handle updating the current user's profile information. This allows authenticated users to update their own profile details.
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
    # Creating patch method to partially update any field that serialzers allows except read onlyy fields.
    def patch(self, request):
        try:
            user = request.user
            # Using partial=True to allow partial updates to the user's profile information, enabling users to update only specific fields without affecting others.
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
    

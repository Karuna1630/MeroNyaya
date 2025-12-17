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

from .serializers import (UserResponseSerializer, RegisterUserSerializer, LoginUserSerializer)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class RegisterUserView(generics.CreateAPIView):
   permission_classes = [AllowAny]
   serializer_class = RegisterUserSerializer

   @transaction.atomic
   def perform_create(self, serializer):
       user = serializer.save()
       return user
   
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

   def post(self, request):
        try:
           serializer = self.get_serializer(data=request.data)
           if serializer.is_valid():
               self.perform_create(serializer)
               return api_response(
                   is_success=True,
                   status_code=status.HTTP_201_CREATED,
                     result={
                         "message": "User registered successfully.",
                         
                         },
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
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
               email = serializer.validated_data['email']
               password = serializer.validated_data['password']

               user = authenticate(request, email=email, password=password)
               if user is not None:
                  user_data = UserResponseSerializer(user).data
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

   def get(self, request, *args, **kwargs):
       try:
           user = self.get_object()
           serializer = self.get_serializer(user)
           return api_response(
               is_success=True,
               status_code=status.HTTP_200_OK,
               result=serializer.data
           )
       except User.DoesNotExist:
           return api_response(
               is_success=False,
               error_message="User not found.",
               status_code=status.HTTP_404_NOT_FOUND,
           )
       except Exception as e:
           return api_response(
               is_success=False,
               error_message=str(e),
               status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           )
    

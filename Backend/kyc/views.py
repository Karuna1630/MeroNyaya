from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import LawyerKYC
from authentication.models import User
from .serializers import (
    LawyerKYCSerializer, 
    KYCStatusSerializer, 
    AdminKYCReviewSerializer,
    LawyerDirectorySerializer
)
from .permissions import IsLawyer, IsOwnerOrAdmin, IsAdminReviewer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class SubmitKYCView(generics.CreateAPIView):
    """
    POST /api/kyc/submit/
    Lawyer submits KYC for verification
    """
    serializer_class = LawyerKYCSerializer
    permission_classes = [IsAuthenticated, IsLawyer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Submit KYC for verification",
        responses={201: LawyerKYCSerializer, 400: "Bad request"},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save()


class MyKYCView(generics.RetrieveAPIView):
    """
    GET /api/kyc/my-kyc/
    Lawyer views their own KYC status and details
    """
    serializer_class = LawyerKYCSerializer
    permission_classes = [IsAuthenticated, IsLawyer]
    
    @swagger_auto_schema(
        operation_description="Get logged-in lawyer's KYC details",
        responses={200: LawyerKYCSerializer, 404: "Not found"},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    def get_object(self):
        return get_object_or_404(LawyerKYC, user=self.request.user)


class UpdateKYCView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/kyc/update/
    Lawyer updates rejected KYC
    """
    serializer_class = LawyerKYCSerializer
    permission_classes = [IsAuthenticated, IsLawyer]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @swagger_auto_schema(
        operation_description="Update rejected KYC submission",
        responses={200: LawyerKYCSerializer, 400: "Bad request"},
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Partially update rejected KYC submission",
        responses={200: LawyerKYCSerializer, 400: "Bad request"},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)
    
    def get_object(self):
        kyc = get_object_or_404(LawyerKYC, user=self.request.user)
        # Serializer validation will check if status == 'rejected'
        return kyc


class KYCStatusView(APIView):
    """
    GET /api/kyc/status/
    Quick check of KYC status (used during login)
    """
    permission_classes = [IsAuthenticated, IsLawyer]
    
    @swagger_auto_schema(
        operation_description="Get quick KYC status check",
        responses={200: KYCStatusSerializer, 404: "Not submitted"},
    )
    def get(self, request):
        try:
            kyc = LawyerKYC.objects.get(user=request.user)
            serializer = KYCStatusSerializer(kyc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LawyerKYC.DoesNotExist:
            return Response(
                {"status": "not_submitted", "message": "KYC not yet submitted"},
                status=status.HTTP_404_NOT_FOUND
            )


# Admin Views
class AdminKYCListView(generics.ListAPIView):
    """
    GET /api/kyc/admin/list/
    Admin views all KYC submissions (can filter by status)
    """
    serializer_class = AdminKYCReviewSerializer
    permission_classes = [IsAuthenticated, IsAdminReviewer]
    queryset = LawyerKYC.objects.all().order_by('-created_at')
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class AdminKYCDetailView(generics.RetrieveAPIView):
    """
    GET /api/kyc/admin/detail/<id>/
    Admin views detailed KYC submission
    """
    serializer_class = AdminKYCReviewSerializer
    permission_classes = [IsAuthenticated, IsAdminReviewer]
    queryset = LawyerKYC.objects.all()
    lookup_field = 'id'


class AdminKYCReviewView(generics.UpdateAPIView):
    """
    PATCH /api/kyc/admin/review/<id>/
    Admin approves or rejects KYC
    """
    serializer_class = AdminKYCReviewSerializer
    permission_classes = [IsAuthenticated, IsAdminReviewer]
    queryset = LawyerKYC.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        kyc = self.get_object()
        new_status = request.data.get('status')
        rejection_reason = request.data.get('rejection_reason')
        
        if new_status not in ['approved', 'rejected']:
            return Response(
                {"error": "Status must be 'approved' or 'rejected'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        kyc.status = new_status
        if new_status == 'rejected' and rejection_reason:
            kyc.rejection_reason = rejection_reason
        kyc.save()
        
        serializer = self.get_serializer(kyc)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VerifiedLawyersListView(generics.ListAPIView):
    """
    GET /api/kyc/verified-lawyers/
    Public endpoint to get all lawyers with profile + optional KYC details
    """
    serializer_class = LawyerDirectorySerializer
    permission_classes = [AllowAny]
    queryset = User.objects.filter(is_lawyer=True).select_related('lawyer_kyc').order_by('-date_joined')
    
    @swagger_auto_schema(
        operation_description="Get all verified lawyers for public view",
        manual_parameters=[
            openapi.Parameter('specialization', openapi.IN_QUERY, description="Filter by specialization", type=openapi.TYPE_STRING),
            openapi.Parameter('city', openapi.IN_QUERY, description="Filter by city/location", type=openapi.TYPE_STRING),
            openapi.Parameter('min_experience', openapi.IN_QUERY, description="Minimum years of experience", type=openapi.TYPE_INTEGER),
            openapi.Parameter('max_fee', openapi.IN_QUERY, description="Maximum consultation fee", type=openapi.TYPE_NUMBER),
        ],
        responses={200: LawyerDirectorySerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by specialization (KYC-based)
        specialization = request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(lawyer_kyc__specializations__icontains=specialization)
        
        # Filter by city
        city = request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by minimum experience
        min_experience = request.query_params.get('min_experience', None)
        if min_experience:
            queryset = queryset.filter(lawyer_kyc__years_of_experience__gte=int(min_experience))
        
        # Filter by maximum fee
        max_fee = request.query_params.get('max_fee', None)
        if max_fee:
            queryset = queryset.filter(lawyer_kyc__consultation_fee__lte=float(max_fee))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

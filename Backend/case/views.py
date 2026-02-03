from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from authentication.models import User

from .models import Case, CaseDocument
from .serializers import (
    CaseSerializer, 
    CaseListSerializer, 
    PublicCaseSerializer,
    CaseDocumentSerializer
)


class CaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing legal cases
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['case_title', 'case_description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Case.objects.none()
        
        # Clients see only their own cases
        if user.role == 'Client':
            queryset = Case.objects.filter(client=user).select_related('client', 'lawyer')
        
        # Lawyers see public cases and cases assigned to them
        elif user.role == 'Lawyer':
            queryset = Case.objects.filter(
                models.Q(lawyer=user) | 
                models.Q(status='public', lawyer_selection='public') |
                models.Q(status='sent_to_lawyers', preferred_lawyers=user)
            ).select_related('client', 'lawyer').distinct()
        
        # Admin sees all cases
        elif user.is_superuser:
            queryset = Case.objects.all().select_related('client', 'lawyer')
        
        # Apply manual filters from query params
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        category_filter = self.request.query_params.get('case_category', None)
        if category_filter:
            queryset = queryset.filter(case_category=category_filter)
        
        urgency_filter = self.request.query_params.get('urgency_level', None)
        if urgency_filter:
            queryset = queryset.filter(urgency_level=urgency_filter)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CaseListSerializer
        elif self.action == 'public_cases':
            return PublicCaseSerializer
        return CaseSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new case (clients only)
        """
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can create cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        preferred_ids = []
        if 'preferred_lawyers' in request.data:
            preferred_ids = request.data.getlist('preferred_lawyers')
            if len(preferred_ids) == 1 and isinstance(preferred_ids[0], str) and ',' in preferred_ids[0]:
                preferred_ids = [item.strip() for item in preferred_ids[0].split(',') if item.strip()]

        if preferred_ids:
            valid_lawyers = User.objects.filter(id__in=preferred_ids, role='Lawyer')
            if valid_lawyers.count() != len(set(preferred_ids)):
                return Response(
                    {'error': 'One or more selected lawyers are invalid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = serializer.save()

        if preferred_ids:
            case.preferred_lawyers.set(valid_lawyers)
        
        # Handle file uploads
        files = request.FILES.getlist('documents')
        for file in files:
            CaseDocument.objects.create(
                case=case,
                file=file,
                file_name=file.name,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size
            )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def public_cases(self, request):
        """
        Get all public cases available for lawyers
        """
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can view public cases'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cases = Case.objects.filter(
            status='public',
            lawyer_selection='public'
        ).select_related('client').order_by('-created_at')
        
        serializer = self.get_serializer(cases, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_documents(self, request, pk=None):
        """
        Upload additional documents to a case
        """
        case = self.get_object()
        
        # Ensure client owns the case
        if case.client != request.user:
            return Response(
                {'error': 'You can only upload documents to your own cases'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        files = request.FILES.getlist('documents')
        if not files:
            return Response(
                {'error': 'No files provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        documents = []
        for file in files:
            doc = CaseDocument.objects.create(
                case=case,
                file=file,
                file_name=file.name,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size
            )
            documents.append(doc)
        
        serializer = CaseDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept_case(self, request, pk=None):
        """
        Lawyer accepts a public case
        """
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can accept cases'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        case = self.get_object()
        
        if case.status != 'public':
            return Response(
                {'error': 'Case is not available for acceptance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case.lawyer = request.user
        case.status = 'accepted'
        case.accepted_at = timezone.now()
        case.save()
        
        serializer = self.get_serializer(case)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """
        Update case status
        """
        case = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status transitions
        valid_statuses = dict(Case.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case.status = new_status
        
        # Assign lawyer when accepting and update timestamps
        if new_status == 'accepted':
            case.lawyer = request.user
            case.accepted_at = timezone.now()
        elif new_status == 'completed':
            case.completed_at = timezone.now()
        
        case.save()
        serializer = self.get_serializer(case)
        return Response(serializer.data)
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_case_details(self, request, pk=None):
        """
        Update case details by assigned lawyer (court info, hearing date, case number, etc.)
        """
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can update case details'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        case = self.get_object()
        
        # Ensure only the assigned lawyer can update
        if case.lawyer != request.user:
            return Response(
                {'error': 'You can only update cases assigned to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Fields that lawyers can update
        updatable_fields = ['case_number', 'court_name', 'opposing_party', 'next_hearing_date', 'status', 'notes']
        
        for field in updatable_fields:
            if field in request.data:
                setattr(case, field, request.data[field])
        
        case.save()
        serializer = self.get_serializer(case)
        return Response(serializer.data)
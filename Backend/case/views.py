from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time
from authentication.models import User

from .models import Case, CaseDocument, CaseTimeline, CaseAppointment
from .serializers import (
    CaseSerializer,
    CaseListSerializer,
    PublicCaseSerializer,
    CaseDocumentSerializer,
    CaseAppointmentSerializer,
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
                models.Q(status__in=['public', 'proposals_received'], lawyer_selection='public') |
                models.Q(status__in=['sent_to_lawyers', 'proposals_received'], preferred_lawyers=user)
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
        
        # Create timeline event for case creation
        CaseTimeline.objects.create(
            case=case,
            event_type='case_created',
            title='Case Created',
            description=f'Case "{case.case_title}" was created by {request.user.name}',
            created_by=request.user
        )
        
        # Handle file uploads
        files = request.FILES.getlist('documents')
        for file in files:
            doc = CaseDocument.objects.create(
                case=case,
                uploaded_by=request.user,
                file=file,
                file_name=file.name,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size
            )
            
            # Create timeline event for document upload
            CaseTimeline.objects.create(
                case=case,
                event_type='document_uploaded',
                title='Document Uploaded',
                description=f'Client ({request.user.name}) uploaded: {file.name}',
                created_by=request.user
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
        
        # Show cases that are public or have proposals being reviewed
        cases = Case.objects.filter(
            models.Q(status__in=['public', 'proposals_received'], lawyer_selection='public') |
            models.Q(status__in=['public', 'proposals_received'], preferred_lawyers=request.user)
        ).select_related('client').distinct().order_by('-created_at')
        
        serializer = self.get_serializer(cases, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def upload_documents(self, request, pk=None):
        """
        Upload additional documents to a case (by client or assigned lawyer)
        """
        case = self.get_object()
        
        # Allow both client and assigned lawyer to upload documents
        if case.client != request.user and case.lawyer != request.user:
            return Response(
                {'error': 'You can only upload documents to your own cases or cases assigned to you'},
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
                uploaded_by=request.user,
                file=file,
                file_name=file.name,
                file_type=file.name.split('.')[-1].lower(),
                file_size=file.size
            )
            documents.append(doc)
            
            # Create timeline event for document upload
            uploader_role = "Client" if case.client == request.user else "Lawyer"
            CaseTimeline.objects.create(
                case=case,
                event_type='document_uploaded',
                title=f'Document Uploaded',
                description=f'{uploader_role} ({request.user.name}) uploaded: {file.name}',
                created_by=request.user
            )
        
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
        
        # Create timeline event for case acceptance
        CaseTimeline.objects.create(
            case=case,
            event_type='case_accepted',
            title='Case Accepted',
            description=f'Lawyer {request.user.name} accepted the case',
            created_by=request.user
        )
        
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
        
        # Create timeline event for status change
        CaseTimeline.objects.create(
            case=case,
            event_type='status_changed',
            title=f'Status Changed to {new_status.title()}',
            description=f'Case status changed to {new_status.replace("_", " ").title()}',
            created_by=request.user
        )
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_timeline_event(self, request, pk=None):
        """
        Add a timeline event (note) to a case
        """
        case = self.get_object()
        
        # Allow both client and assigned lawyer to add notes
        if case.client != request.user and case.lawyer != request.user:
            return Response(
                {'error': 'You can only add notes to your own cases or cases assigned to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        event_type = request.data.get('event_type', 'note_added')
        title = request.data.get('title')
        description = request.data.get('description')
        
        # Validate required fields
        if not title:
            return Response(
                {'error': 'Title (topic) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not description:
            return Response(
                {'error': 'Description is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        timeline_event = CaseTimeline.objects.create(
            case=case,
            event_type=event_type,
            title=title,
            description=description,
            created_by=request.user
        )
        
        from .serializers import CaseTimelineSerializer
        serializer = CaseTimelineSerializer(timeline_event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def schedule_meeting(self, request, pk=None):
        """
        Schedule a case appointment (client only)
        """
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can schedule case appointments'},
                status=status.HTTP_403_FORBIDDEN
            )

        case = self.get_object()
        if case.client != request.user:
            return Response(
                {'error': 'You can only schedule appointments for your own cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate that the case has been accepted by a lawyer
        if case.status != 'accepted':
            return Response(
                {'error': f'Case must be accepted by a lawyer before scheduling appointments. Current status: {case.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate that a lawyer has been assigned
        if not case.lawyer:
            return Response(
                {'error': 'No lawyer has been assigned to this case yet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CaseAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save(
            case=case,
            client=request.user,
            lawyer=case.lawyer
        )

        return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class CaseAppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing case appointments
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CaseAppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = CaseAppointment.objects.none()

        if user.role == 'Client':
            queryset = CaseAppointment.objects.filter(client=user).select_related('case', 'client', 'lawyer')
        elif user.role == 'Lawyer':
            queryset = CaseAppointment.objects.filter(case__lawyer=user).select_related('case', 'client', 'lawyer')
        elif user.is_superuser:
            queryset = CaseAppointment.objects.all().select_related('case', 'client', 'lawyer')

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        """
        Confirm a case appointment (lawyer only)
        """
        appointment = self.get_object()

        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can confirm case appointments'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.case.lawyer != request.user:
            return Response(
                {'error': 'You can only confirm appointments for your assigned cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        scheduled_date_raw = request.data.get('scheduled_date')
        scheduled_time_raw = request.data.get('scheduled_time')
        meeting_link = request.data.get('meeting_link')

        if not scheduled_date_raw:
            return Response({'error': 'scheduled_date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not scheduled_time_raw:
            return Response({'error': 'scheduled_time is required'}, status=status.HTTP_400_BAD_REQUEST)
        if appointment.mode == CaseAppointment.MODE_VIDEO and not meeting_link:
            return Response({'error': 'meeting_link is required for video appointments'}, status=status.HTTP_400_BAD_REQUEST)

        scheduled_date = parse_date(scheduled_date_raw)
        scheduled_time = parse_time(scheduled_time_raw)

        if not scheduled_date:
            return Response({'error': 'scheduled_date must be a valid date'}, status=status.HTTP_400_BAD_REQUEST)
        if not scheduled_time:
            return Response({'error': 'scheduled_time must be a valid time'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.scheduled_date = scheduled_date
        appointment.scheduled_time = scheduled_time
        appointment.meeting_link = meeting_link if appointment.mode == CaseAppointment.MODE_VIDEO else None
        appointment.status = CaseAppointment.STATUS_CONFIRMED
        appointment.save()

        return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """
        Reject a case appointment (lawyer only)
        """
        appointment = self.get_object()

        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can reject case appointments'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.case.lawyer != request.user:
            return Response(
                {'error': 'You can only reject appointments for your assigned cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        appointment.status = CaseAppointment.STATUS_CANCELLED
        appointment.save()

        return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """
        Mark a case appointment as completed (lawyer only)
        """
        appointment = self.get_object()

        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can complete case appointments'},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.case.lawyer != request.user:
            return Response(
                {'error': 'You can only complete appointments for your assigned cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        appointment.status = CaseAppointment.STATUS_COMPLETED
        appointment.save()

        return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_200_OK)
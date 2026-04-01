from rest_framework.views import APIView
from rest_framework import status, generics, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time
from authentication.models import User
from notification.utils import send_notification

from .models import Case, CaseDocument, CaseTimeline, CaseAppointment
from .serializers import (
    CaseSerializer,
    CaseListSerializer,
    PublicCaseSerializer,
    CaseDocumentSerializer,
    CaseAppointmentSerializer,
)


# ─────────────────────────────────────────────────────
# Case Views
# ─────────────────────────────────────────────────────

class CaseListCreateView(generics.ListCreateAPIView):
    """
    List all cases or create a new one.
    GET /api/cases/
    POST /api/cases/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['case_title', 'case_description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Case.objects.none()
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
        if self.request.method == 'GET':
            return CaseListSerializer
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
        # handle preferred lawyers if provided
        preferred_ids = []
        if 'preferred_lawyers' in request.data:
            preferred_ids = request.data.getlist('preferred_lawyers')
            if len(preferred_ids) == 1 and isinstance(preferred_ids[0], str) and ',' in preferred_ids[0]:
                preferred_ids = [item.strip() for item in preferred_ids[0].split(',') if item.strip()]

        # Validate preferred lawyer IDs if provided
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

        # Set preferred lawyers if provided
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
            document_data = {
                "file": file,
                "file_name": file.name,
                "file_type": file.name.split('.')[-1].lower(),
                "file_size": file.size,
                "uploaded_by": request.user.id
            }
            doc_serializer = CaseDocumentSerializer(data=document_data)
            doc_serializer.is_valid(raise_exception=True)
            doc_serializer.save(case=case)

            CaseTimeline.objects.create(
                case=case,
                event_type='document_uploaded',
                title='Document Uploaded',
                description=f'Client ({request.user.name}) uploaded: {file.name}',
                created_by=request.user
            )

        # Notify preferred lawyers about the new case
        if preferred_ids:
            for lawyer in valid_lawyers:
                send_notification(
                    user=lawyer,
                    title='New Case Available',
                    message=f'{request.user.name} posted a new case: "{case.case_title}"',
                    notif_type='case',
                    link='/lawyercaserequest'
                )
        else:
            all_lawyers = User.objects.filter(role='Lawyer')
            for lawyer in all_lawyers:
                send_notification(
                    user=lawyer,
                    title='New Public Case Available',
                    message=f'{request.user.name} posted a new public case: "{case.case_title}"',
                    notif_type='case',
                    link='/lawyerfindcases'
                )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific case.
    GET/PUT/PATCH/DELETE /api/cases/<pk>/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CaseSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Case.objects.all().select_related('client', 'lawyer')
        if user.role == 'Client':
            return Case.objects.filter(client=user).select_related('client', 'lawyer')
        if user.role == 'Lawyer':
            return Case.objects.filter(
                models.Q(lawyer=user) |
                models.Q(status__in=['public', 'proposals_received'], lawyer_selection='public') |
                models.Q(status__in=['sent_to_lawyers', 'proposals_received'], preferred_lawyers=user)
            ).select_related('client', 'lawyer').distinct()
        return Case.objects.none()


class PublicCasesView(APIView):
    """
    Get all public cases available for lawyers.
    GET /api/cases/public_cases/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can view public cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        cases = Case.objects.filter(
            models.Q(status__in=['public', 'proposals_received'], lawyer_selection='public') |
            models.Q(status__in=['public', 'proposals_received'], preferred_lawyers=request.user)
        ).select_related('client').distinct().order_by('-created_at')

        serializer = PublicCaseSerializer(cases, many=True)
        return Response(serializer.data)


class CaseUploadDocumentsView(APIView):
    """
    Upload additional documents to a case.
    POST/PATCH /api/cases/<pk>/upload_documents/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _handle_upload(self, request, pk):
        case = get_object_or_404(Case, pk=pk)

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

            uploader_role = "Client" if case.client == request.user else "Lawyer"
            CaseTimeline.objects.create(
                case=case,
                event_type='document_uploaded',
                title=f'Document Uploaded',
                description=f'{uploader_role} ({request.user.name}) uploaded: {file.name}',
                created_by=request.user
            )

        # Notify the other party
        notify_user = case.lawyer if case.client == request.user else case.client
        if notify_user:
            send_notification(
                user=notify_user,
                title='New Document Uploaded',
                message=f'{request.user.name} uploaded {len(documents)} document(s) to case "{case.case_title}"',
                notif_type='case',
                link=f'/client/case/{case.id}' if notify_user == case.client else f'/lawyercase/{case.id}'
            )

        serializer = CaseDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    def post(self, request, pk):
        return self._handle_upload(request, pk)





class CaseActionView(APIView):
    """
    Handle various case actions: update_status, update_case_details, add_timeline_event, schedule_meeting.
    PATCH/POST /api/cases/<pk>/<action>/
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, action):
        case = get_object_or_404(Case, pk=pk)

        if action == 'update_status':
            new_status = request.data.get('status')
            if not new_status:
                return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
            if new_status not in dict(Case.STATUS_CHOICES).keys():
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

            case.status = new_status
            if new_status == 'accepted':
                case.lawyer = request.user
                case.accepted_at = timezone.now()
            elif new_status == 'completed':
                from payment.models import CasePaymentRequest
                payment_request = CasePaymentRequest.objects.filter(case=case).first()
                if not payment_request or payment_request.status != 'paid':
                    return Response({'error': 'Case can only be marked as completed after the agreed payment is received.'}, status=status.HTTP_400_BAD_REQUEST)
                case.completed_at = timezone.now()

            case.save()

            CaseTimeline.objects.create(
                case=case, event_type='status_changed',
                title=f'Status Changed to {new_status.title()}',
                description=f'Case status changed to {new_status.replace("_", " ").title()}',
                created_by=request.user
            )

            if case.client and case.client != request.user:
                send_notification(user=case.client, title='Case Status Updated', message=f'Your case "{case.case_title}" is now {new_status.replace("_", " ").title()}', notif_type='case', link=f'/client/case/{case.id}')
            if case.lawyer and case.lawyer != request.user:
                send_notification(user=case.lawyer, title='Case Status Updated', message=f'Case "{case.case_title}" is now {new_status.replace("_", " ").title()}', notif_type='case', link=f'/lawyercase/{case.id}')

            return Response(CaseSerializer(case).data)

        elif action == 'update_case_details':
            if request.user.role != 'Lawyer':
                return Response({'error': 'Only lawyers can update case details'}, status=status.HTTP_403_FORBIDDEN)
            if case.lawyer != request.user:
                return Response({'error': 'You can only update cases assigned to you'}, status=status.HTTP_403_FORBIDDEN)

            for field in ['case_number', 'court_name', 'opposing_party', 'next_hearing_date', 'status', 'notes']:
                if field in request.data:
                    value = request.data[field]
                    if field == 'next_hearing_date' and value == '':
                        value = None
                    setattr(case, field, value)

            case.save()
            status_display = case.status.replace('_', ' ').title()
            CaseTimeline.objects.create(case=case, event_type='status_changed', title=f'Status Changed to {status_display}', description=f'Case status changed to {status_display}', created_by=request.user)
            
            if case.client:
                send_notification(user=case.client, title='Case Status Updated', message=f'Your case "{case.case_title}" is now {status_display}', notif_type='case', link=f'/client/case/{case.id}')
            return Response(CaseSerializer(case).data)

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, pk, action):
        case = get_object_or_404(Case, pk=pk)

        if action == 'add_timeline_event':
            if case.client != request.user and case.lawyer != request.user:
                return Response({'error': 'You can only add notes to your own cases or cases assigned to you'}, status=status.HTTP_403_FORBIDDEN)

            title = request.data.get('title')
            description = request.data.get('description')
            if not title or not description:
                return Response({'error': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)

            timeline_event = CaseTimeline.objects.create(
                case=case, event_type=request.data.get('event_type', 'note_added'),
                title=title, description=description, created_by=request.user
            )

            notify_user = case.client if request.user == case.lawyer else case.lawyer
            if notify_user:
                send_notification(user=notify_user, title='Case Timeline Updated', message=f'A new update was added to your case "{case.case_title}": {title}', notif_type='case', link=f'/client/case/{case.id}' if notify_user == case.client else f'/lawyercase/{case.id}')

            from .serializers import CaseTimelineSerializer
            return Response(CaseTimelineSerializer(timeline_event).data, status=status.HTTP_201_CREATED)

        elif action == 'schedule_meeting':
            if request.user.role != 'Client':
                return Response({'error': 'Only clients can schedule case appointments'}, status=status.HTTP_403_FORBIDDEN)
            if case.client != request.user:
                return Response({'error': 'You can only schedule appointments for your own cases'}, status=status.HTTP_403_FORBIDDEN)
            if case.status not in ['accepted', 'in_progress']:
                return Response({'error': f'Case must be accepted or in progress before scheduling appointments.'}, status=status.HTTP_400_BAD_REQUEST)
            if not case.lawyer:
                return Response({'error': 'No lawyer has been assigned to this case yet'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = CaseAppointmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            appointment = serializer.save(case=case, client=request.user, lawyer=case.lawyer)

            send_notification(user=case.lawyer, title='New Meeting Request', message=f'{request.user.name} requested a meeting for case "{case.case_title}"', notif_type='appointment', link='/lawyerappointment')
            return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────
# Case Appointment Views
# ─────────────────────────────────────────────────────

class CaseAppointmentListCreateView(generics.ListCreateAPIView):
    """
    List all case appointments or create a new one.
    GET /api/cases/appointments/
    POST /api/cases/appointments/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CaseAppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return CaseAppointment.objects.none()

        if user.role == 'Client':
            return CaseAppointment.objects.filter(client=user).select_related('case', 'client', 'lawyer')
        elif user.role == 'Lawyer':
            return CaseAppointment.objects.filter(case__lawyer=user).select_related('case', 'client', 'lawyer')
        elif user.is_superuser:
            return CaseAppointment.objects.all().select_related('case', 'client', 'lawyer')

        return CaseAppointment.objects.none()





class CaseAppointmentActionView(APIView):
    """
    Handle case appointment actions: confirm, reject, complete (lawyer only).
    POST /api/cases/appointments/<pk>/<action>/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, action):
        appointment = get_object_or_404(CaseAppointment, pk=pk)

        if request.user.role != 'Lawyer':
            return Response({'error': 'Only lawyers can process case appointments'}, status=status.HTTP_403_FORBIDDEN)

        if appointment.case.lawyer != request.user:
            return Response({'error': 'You can only process appointments for your assigned cases'}, status=status.HTTP_403_FORBIDDEN)

        if action == 'confirm':
            scheduled_date_raw = request.data.get('scheduled_date')
            scheduled_time_raw = request.data.get('scheduled_time')
            meeting_link = request.data.get('meeting_link')

            if not scheduled_date_raw or not scheduled_time_raw:
                return Response({'error': 'scheduled_date and scheduled_time are required'}, status=status.HTTP_400_BAD_REQUEST)

            appointment.scheduled_date = parse_date(scheduled_date_raw)
            appointment.scheduled_time = parse_time(scheduled_time_raw)
            appointment.meeting_link = meeting_link if appointment.mode == CaseAppointment.MODE_VIDEO else None
            appointment.status = CaseAppointment.STATUS_CONFIRMED
            title_msg = 'Appointment Confirmed'
            body_msg = f'has been confirmed by {request.user.name}'

        elif action == 'reject':
            appointment.status = CaseAppointment.STATUS_CANCELLED
            title_msg = 'Appointment Rejected'
            body_msg = f'was rejected by {request.user.name}'

        elif action == 'complete':
            appointment.status = CaseAppointment.STATUS_COMPLETED
            title_msg = 'Appointment Completed'
            body_msg = 'has been marked as completed'
        
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        appointment.save()

        send_notification(
            user=appointment.client,
            title=title_msg,
            message=f'Your appointment for case "{appointment.case.case_title}" {body_msg}',
            notif_type='appointment',
            link='/clientappointment'
        )

        return Response(CaseAppointmentSerializer(appointment).data, status=status.HTTP_200_OK)
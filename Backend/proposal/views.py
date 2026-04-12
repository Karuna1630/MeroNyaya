from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone

from .models import Proposal
from case.models import Case
from .serializers import ProposalSerializer, ProposalListSerializer
from notification.utils import send_notification


class ProposalListCreateView(generics.ListCreateAPIView):
    """
    List all proposals or create a new one.
    GET /api/proposals/
    POST /api/proposals/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Proposal.objects.none()

        # Lawyers see their own proposals
        if user.role == 'Lawyer':
            queryset = Proposal.objects.filter(lawyer=user).select_related('case', 'lawyer')
        # Clients see proposals for their cases
        elif user.role == 'Client':
            queryset = Proposal.objects.filter(case__client=user).select_related('case', 'lawyer')
        # Admin sees all proposals
        elif user.is_superuser:
            queryset = Proposal.objects.all().select_related('case', 'lawyer')
        else:
            queryset = Proposal.objects.none()

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProposalListSerializer
        return ProposalSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new proposal (lawyers only)
        """
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can submit proposals'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if case exists and is open
        case_id = request.data.get('case')
        if not case_id:
            return Response(
                {'error': 'Case ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        case = get_object_or_404(Case, id=case_id)

        if not case.is_open:
            return Response(
                {'error': 'This case is no longer accepting proposals'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if lawyer already submitted a proposal for this case
        existing_proposal = Proposal.objects.filter(
            case=case,
            lawyer=request.user
        ).first()
        if existing_proposal:
            return Response(
                {'error': 'You have already submitted a proposal for this case'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = serializer.save()

        # Update case proposal count and status
        case.proposal_count += 1
        if case.status in ['public', 'sent_to_lawyers']:
            case.status = 'proposals_received'
        case.save()

        # Notify client that a new proposal was received
        send_notification(
            user=case.client,
            title='New Proposal Received',
            message=f'Lawyer {request.user.name} submitted a proposal for your case "{case.case_title}"',
            notif_type='case',
            link=f'/client/case/{case.id}/proposals'
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific proposal.
    GET/PUT/PATCH/DELETE /api/proposals/<pk>/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProposalSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Proposal.objects.none()

        user = self.request.user
        if not user.is_authenticated:
            return Proposal.objects.none()

        if user.role == 'Lawyer':
            return Proposal.objects.filter(lawyer=user).select_related('case', 'lawyer')
        elif user.role == 'Client':
            return Proposal.objects.filter(case__client=user).select_related('case', 'lawyer')
        elif user.is_superuser:
            return Proposal.objects.all().select_related('case', 'lawyer')
        return Proposal.objects.none()


class ProposalAcceptView(APIView):
    """
    Accept a proposal (clients only).
    POST /api/proposals/<pk>/accept/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can accept proposals'},
                status=status.HTTP_403_FORBIDDEN
            )

        proposal = get_object_or_404(Proposal, pk=pk)

        # Verify the client owns the case
        if proposal.case.client != request.user:
            return Response(
                {'error': 'You can only accept proposals for your own cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if proposal is still pending
        if not proposal.is_pending:
            return Response(
                {'error': 'This proposal has already been reviewed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accept the proposal
        proposal.accept()

        # Reject all other proposals for this case
        Proposal.objects.filter(case=proposal.case).exclude(id=proposal.id).update(
            status='rejected',
            reviewed_at=timezone.now()
        )

        # Update case status and assign lawyer
        case = proposal.case
        case.lawyer = proposal.lawyer
        case.status = 'accepted'
        case.accepted_at = timezone.now()
        case.save()

        serializer = ProposalSerializer(proposal)

        # Notify the accepted lawyer
        send_notification(
            user=proposal.lawyer,
            title='Proposal Accepted',
            message=f'Your proposal for case "{proposal.case.case_title}" has been accepted by {request.user.name}',
            notif_type='case',
            link=f'/lawyercase/{proposal.case.id}'
        )

        # Notify rejected lawyers
        rejected_proposals = Proposal.objects.filter(
            case=proposal.case, status='rejected'
        ).exclude(id=proposal.id).select_related('lawyer')
        for p in rejected_proposals:
            send_notification(
                user=p.lawyer,
                title='Proposal Not Selected',
                message=f'Your proposal for case "{proposal.case.case_title}" was not selected',
                notif_type='case',
                link='/lawyerfindcases'
            )

        return Response(serializer.data)


class ProposalRejectView(APIView):
    """
    Reject a proposal (clients only).
    POST /api/proposals/<pk>/reject/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can reject proposals'},
                status=status.HTTP_403_FORBIDDEN
            )

        proposal = get_object_or_404(Proposal, pk=pk)

        # Verify the client owns the case
        if proposal.case.client != request.user:
            return Response(
                {'error': 'You can only reject proposals for your own cases'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if proposal is still pending
        if not proposal.is_pending:
            return Response(
                {'error': 'This proposal has already been reviewed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reject the proposal with optional feedback
        feedback = request.data.get('client_feedback', None)
        proposal.reject(feedback)

        serializer = ProposalSerializer(proposal)

        # Notify lawyer that their proposal was rejected
        send_notification(
            user=proposal.lawyer,
            title='Proposal Rejected',
            message=f'Your proposal for case "{proposal.case.case_title}" was rejected',
            notif_type='case',
            link='/lawyerfindcases'
        )

        return Response(serializer.data)


class ProposalWithdrawView(APIView):
    """
    Withdraw a proposal (lawyers only).
    POST /api/proposals/<pk>/withdraw/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can withdraw proposals'},
                status=status.HTTP_403_FORBIDDEN
            )

        proposal = get_object_or_404(Proposal, pk=pk)

        # Verify the lawyer owns the proposal
        if proposal.lawyer != request.user:
            return Response(
                {'error': 'You can only withdraw your own proposals'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if proposal is still pending
        if not proposal.is_pending:
            return Response(
                {'error': 'Only pending proposals can be withdrawn'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Withdraw the proposal
        proposal.withdraw()

        # Update case proposal count
        case = proposal.case
        case.proposal_count = max(0, case.proposal_count - 1)
        case.save()

        serializer = ProposalSerializer(proposal)
        return Response(serializer.data)

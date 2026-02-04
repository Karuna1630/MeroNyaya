from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone

from .models import Proposal
from case.models import Case
from .serializers import ProposalSerializer, ProposalListSerializer


class ProposalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing proposals
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Proposal.objects.none()
        
        # Lawyers see their own proposals
        if user.role == 'Lawyer':
            queryset = Proposal.objects.filter(lawyer=user).select_related('case', 'lawyer')
        
        # Clients see proposals for their cases
        elif user.role == 'Client':
            queryset = Proposal.objects.filter(case__client=user).select_related('case', 'lawyer')
        
        # Admin sees all proposals
        elif user.is_superuser:
            queryset = Proposal.objects.all().select_related('case', 'lawyer')
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
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
        # Mark that proposals are being received (but still accepting more)
        if case.status in ['public', 'sent_to_lawyers']:
            case.status = 'proposals_received'
        case.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accept a proposal (clients only)
        """
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can accept proposals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        proposal = self.get_object()
        
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
        
        serializer = self.get_serializer(proposal)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a proposal (clients only)
        """
        if request.user.role != 'Client':
            return Response(
                {'error': 'Only clients can reject proposals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        proposal = self.get_object()
        
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
        
        serializer = self.get_serializer(proposal)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """
        Withdraw a proposal (lawyers only)
        """
        if request.user.role != 'Lawyer':
            return Response(
                {'error': 'Only lawyers can withdraw proposals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        proposal = self.get_object()
        
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
        
        serializer = self.get_serializer(proposal)
        return Response(serializer.data)

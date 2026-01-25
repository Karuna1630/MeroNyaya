from rest_framework.permissions import BasePermission


class IsLawyer(BasePermission):
    """Only lawyers can submit KYC"""
    
    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.is_lawyer
        )


class IsOwnerOrAdmin(BasePermission):
    """Only the owner can view their KYC or admin can view all"""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
    
    def has_object_permission(self, request, view, obj):
        # Get the user from the KYC object
        kyc_user = getattr(obj, 'user', None)
        if kyc_user is None and hasattr(obj, 'kyc'):
            kyc_user = getattr(obj.kyc, 'user', None)
        
        # Allow if user is admin or owner
        return bool(
            request.user.is_staff
            or request.user.is_superuser
            or request.user.role == "SuperAdmin"
            or kyc_user == request.user
        )


class IsAdminReviewer(BasePermission):
    """Only admin can review and approve/reject KYC"""
    
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff 
                or request.user.is_superuser 
                or request.user.role == "SuperAdmin"
            )
        )

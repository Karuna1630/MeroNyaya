from rest_framework.permissions import BasePermission

# Custom permission to check if the user is a superuser
class IsSuperUser(BasePermission):
    

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated 
                    and request.user.role =="SuperAdmin")


class IsClient(BasePermission):
    """Permission class to check if user is a client"""
    
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and 
                    request.user.role == "Client")


class IsLawyer(BasePermission):
    """Permission class to check if user is a lawyer"""
    
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and 
                    request.user.role == "Lawyer")

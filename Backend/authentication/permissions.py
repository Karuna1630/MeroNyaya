from rest_framework.permissions import BasePermission

#  Creating Custom permission to check if the user is a superuser
class IsSuperUser(BasePermission):
   
    # check if the user is authenticated and is superadmin
    def has_permission(self, request, view):
        # Return true if the user is authenticated and has the role of SuperAdmin, otherwise return false.
        return bool(request.user.is_authenticated 
                    and request.user.role =="SuperAdmin")

#  Creating Custom permission to check if the user is a client
class IsClient(BasePermission):
   
    # check if the user is authenticated and is client
    def has_permission(self, request, view):
        # Return true if the user is authenticated and has the role of Client, otherwise return false.
        return bool(request.user.is_authenticated and 
                    request.user.role == "Client")

#  Creating Custom permission to check if the user is a lawyer
class IsLawyer(BasePermission):
   
    # check if the user is authenticated and is lawyer
    def has_permission(self, request, view):
        # Return true if the user is authenticated and has the role of Lawyer, otherwise return false.
        return bool(request.user.is_authenticated and 
                    request.user.role == "Lawyer")

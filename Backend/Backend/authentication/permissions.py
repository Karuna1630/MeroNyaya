from rest_framework.permissions import BasePermission

# Custom permission to check if the user is a superuser
class IsSuperUser(BasePermission):
    

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated 
                    and request.user.role =="SuperAdmin")
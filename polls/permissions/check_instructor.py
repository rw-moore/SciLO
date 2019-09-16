from rest_framework import permissions


class IsInstructor(permissions.IsAuthenticated):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.profile.is_instructor

class IsInstructorOrAdmin(permissions.IsAuthenticated):
    """
    Global permission check for blacklisted IPs.
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.profile.is_instructor or request.user.is_staff)

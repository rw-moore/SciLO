from rest_framework import permissions
from polls.models import Attempt


class OwnAttempt(permissions.IsAuthenticated):
    """
    permission check if a user has this attempt
    admin always allow to access
    """

    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        else:
            if user.is_staff:
                return True

        pk = view.kwargs.get('attempt_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        return Attempt.objects.filter(pk=pk, student__id=user.id).exists()

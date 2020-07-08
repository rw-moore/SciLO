from rest_framework import permissions
from django.contrib.auth.models import Permission
from polls.models import Course, UserRole

class IsInstructorOrAdmin(permissions.IsAuthenticated):
    """
    permission check for if user is instructor or admin.
    """

    def has_permission(self, request, view):
        print(request.query_params)
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is None:
            pk = request.data.get('pk', None)
        if pk is None:
            pk = request.data.get('id', None)
        if pk is None:
            pk = dict(request.query_params).get('courses[]', None)
            if pk is not None:
                pk = int(pk[0])
        print("course pk={}".format(pk))
        if super().has_permission(request, view) and pk is not None:
            course = Course.objects.get(pk=pk)
            return UserRole.objects.filter(user=request.user, course=course, role__permissions__codename='view_question').exists()
        return False

class QuestionBank(permissions.IsAuthenticated):
    """
    permission check for everything necessary to view QuestionBank page
    """

    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.is_staff or request.user.can_view_questionbank())

from rest_framework import permissions
# from django.shortcuts import get_object_or_404
from polls.models import Course #, UserProfile
from polls.models.role import Role


class InCourse(permissions.IsAuthenticated):
    """
    permission check if a user exists in the course with pk/course_id
    admin always allow to access
    """

    def has_permission(self, request, view):
        print("in course perm")
        if super().has_permission(request, view) is False:
            return False
        if request.user.is_admin:
            return True

        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        if pk is None:
            pk = request.query_params.get('courses[]', None)
        print("course pk={}".format(pk))
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = Role.objects.get(course=course, user=request.user)
                print('role exists' + str(role))
                if role.role == Role.INSTRUCTOR:
                    return True
            except Role.DoesNotExist:
                pass
        return False

class IsInstructorInCourse(permissions.IsAuthenticated):
    """
    permission check if a instructor exists in the course with pk/course_id
    admin always allow to access
    """

    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        if user.is_admin:
            return True
        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        if pk is None:
            pk = request.query_params.get('courses[]', None)
        print("course pk={}".format(pk))
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = Role.objects.get(course=course, user=user)
                if role.role == Role.INSTRUCTOR:
                    return True
            except Role.DoesNotExist:
                pass
        return False

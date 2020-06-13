from rest_framework import permissions
from django.contrib.auth.models import Permission
from polls.models import Course, UserRole #, UserProfile


class InCourse(permissions.IsAuthenticated):
    """
    permission check if a user exists in the course with pk/course_id
    admin always allow to access
    """

    def has_permission(self, request, view):
        print("in course perm")
        # print(request.user.get_group_permissions())
        if super().has_permission(request, view) is False:
            return False
        if request.user.is_staff:
            return True

        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        print("course pk={}".format(pk))
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='view_course')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
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
        if user.is_staff:
            return True
        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        print("course pk={}".format(pk))
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=user, course=course).role
                # perm = Permission.get(codename='')
                if len(role.permissions.all()) > 0:
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

class CanSetEnrollmentRole(permissions.IsAuthenticated):
    """
    permission check if a user can set a new role to be assigned when using enrollment code
    """
    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        if user.is_staff:
            return True
        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        print("course pk={}".format(pk))
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=user, course=course).role
                perm = Permission.get(codename='access_code')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

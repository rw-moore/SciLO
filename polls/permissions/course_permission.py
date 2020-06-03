from rest_framework import permissions
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
                role = UserRole.get(user=request.user, course=course).role
                perm = None # Permission.get(codename='')
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
                role = UserRole.get(user=user, course=course).role
                perm = None # Permission.get(codename='')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

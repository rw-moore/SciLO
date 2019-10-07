from rest_framework import permissions
from django.shortcuts import get_object_or_404
from polls.models import Course


class InCourse(permissions.IsAuthenticated):
    """
    permission check if a user exists in the course with pk/course_id
    admin always allow to access
    """

    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        else:
            if user.is_staff:
                return True

        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        course = get_object_or_404(Course, pk=pk)
        ugs = user.groups.all()
        cgs = course.groups.all()
        return len(ugs.union(cgs)) < len(cgs) + len(ugs)

class IsInstructorInCourse(permissions.IsAuthenticated):
    """
    permission check if a instructor exists in the course with pk/course_id
    admin always allow to access
    """

    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        else:
            if user.is_staff:
                return True
            if user.profile.is_instructor is False:
                return False
        pk = view.kwargs.get('course_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        course = get_object_or_404(Course, pk=pk)
        return user.groups.filter(name='COURSE_'+course.shortname+'_instructor_group').exists()

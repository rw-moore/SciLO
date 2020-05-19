from rest_framework import permissions
from polls.models import Course
from polls.models.role import Role
from django.shortcuts import get_object_or_404

# class IsInstructor(permissions.IsAuthenticated):
#     """
#     permission check for if user is instructor
#     """

#     def has_permission(self, request, view):
#         return super().has_permission(request, view) and request.user.profile.is_instructor


class IsInstructorOrAdmin(permissions.IsAuthenticated):
    """
    permission check for if user is instructor or admin.
    """

    def has_permission(self, request, view):
        # print(request.query_params)
        pk = request.data.get('course',None)
        if pk is None:
            pk = request.data.get('pk', None)
        if pk is None:
            pk = request.query_params.get('courses[]',None)
        print("course pk={}".format(pk))
        if super().has_permission(request, view) and pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = Role.objects.get(course=course, user=request.user)
                print('role exists' + str(role))
                if role.role == Role.INSTRUCTOR:
                    return True
            except Role.DoesNotExist:
                pass
        print("checking admin")
        return request.user.is_admin

class IsAdministrator(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        pk = view.kwargs.get('course_id',None)
        if pk is None:
            pk = view.kwargs.get('pk',None)
        course = get_object_or_404(Course, pk=pk)
        if super().has_permission(request, view):
            return request.user.is_admin
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from polls.models import Attempt, Quiz


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


class InQuiz(permissions.IsAuthenticated):
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
        qpk = view.kwargs.get('quiz_id', None)
        quiz = get_object_or_404(Quiz, pk=qpk)
        course = quiz.course
        ugs = user.groups.all()
        cgs = course.groups.all()
        return len(ugs.union(cgs)) < len(cgs) + len(ugs)

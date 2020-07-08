from rest_framework import permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Permission
from polls.models import Attempt, Quiz, UserRole


class OwnAttempt(permissions.IsAuthenticated):
    """
    permission check if a user has this attempt
    admin always allow to access
    """

    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        if user.is_staff:
            return True
        pk = view.kwargs.get('attempt_id', None)
        if pk is None:
            pk = view.kwargs.get('pk', None)
        if pk is not None:
            course = Attempt.objects.get(pk=pk).quiz.course
            return UserRole.objects.filter(user=user, course=course, role__permissions__codename='view_attempt').exists()
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
        if user.is_staff:
            return True
        qpk = view.kwargs.get('quiz_id', None)
        quiz = get_object_or_404(Quiz, pk=qpk)
        course = quiz.course
        return UserRole.objects.filter(usr=user, course=course).exists()

class InstructorInQuiz(permissions.IsAuthenticated):
    """
    permission check if a user is an instructor in the course with
    the attempts quiz
    admin always allwed to access
    """
    def has_permission(self, request, view):
        user = request.user
        if super().has_permission(request, view) is False:
            return False
        if user.is_staff:
            return True
        q_id = view.kwargs.get('quiz_id', None)
        quiz = get_object_or_404(Quiz, pk=q_id)
        course = quiz.course
        return UserRole.objects.filter(user=user, course=course, role__permissions__codename='view_attempt').exists()

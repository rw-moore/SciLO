from django.shortcuts import get_object_or_404
from rest_framework import permissions

# from django.contrib.auth.models import Permission
from polls.models import Course, Quiz, UserRole


class EditQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('edit quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            return UserRole.objects.filter(user=request.user, course__pk=pk, role__permissions__codename='change_quiz').exists()
        return False

class ViewQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('view quiz')
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
        if pk is None:
            pk = dict(view.kwargs).get('pk', None)
            if pk is not None:
                course = Quiz.objects.get(pk=int(pk)).course
        else:
            course = Course.objects.get(pk=pk)
        if pk is not None:
            return UserRole.objects.filter(user=request.user, course=course, role__permissions__codename='view_quiz').exists()
        return False

class CreateQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('create quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            return UserRole.objects.filter(user=request.user, course__pk=pk, role__permissions__codename='add_quiz').exists()
        return False

class DeleteQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('delete quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            return UserRole.objects.filter(user=request.user, course__pk=pk, role__permissions__codename='delete_quiz').exists()
        return False

class GetQuizSecrets(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('get secrets perms')
        if request.user.is_staff:
            return True
        quiz_pk = view.kwargs.get('quiz_id', None)
        quiz = get_object_or_404(Quiz, pk=quiz_pk)
        if quiz.course is None:
            return quiz.author == request.user
        return UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='change_quiz').exists()

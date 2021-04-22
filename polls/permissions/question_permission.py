from rest_framework import permissions
# from django.contrib.auth.models import Permission
from django.shortcuts import get_object_or_404
from polls.models import Course, UserRole, Question


class EditQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('edit question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            course = Course.objects.get(pk=pk)
            return UserRole.objects.filter(user=request.user, course=course, role__permissions__codename='change_question').exists()
        else:
            pk = dict(view.kwargs).get('pk', None)
            return Question.objects.filter(pk=int(pk), owner=request.user, course=None).exists()

class ViewQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('view question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is None:
            pk = request.data.get('pk', None)
        if pk is None:
            pk = request.data.get('id', None)
        if pk is None:
            pk = dict(view.kwargs).get('pk', None)
            if pk is not None:
                question = get_object_or_404(Question, pk=pk)
                if question.course:
                    return UserRole.objects.filter(user=request.user, course=question.course, role__permissions__codename='view_question').exists()
                else:
                    return Question.objects.filter(pk=int(pk), owner=request.user, course=None).exists()
        else:
            return UserRole.objects.filter(user=request.user, course__pk=pk, role__permissions__codename='view_question').exists()
        return False

class CreateQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('create question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            return UserRole.objects.filter(user=request.user, course__pk=pk, role__permissions__codename='add_question').exists()
        return UserRole.objects.filter(user=request.user, role__permissions__codename='add_question').exists()

class DeleteQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('delete question')
        if request.user.is_staff:
            return True
        pk = dict(view.kwargs).get('pk', None)
        if Question.objects.filter(pk=int(pk), owner=request.user, course=None).exists():
            return True
        else:
            question = get_object_or_404(Question, pk=pk)
            return UserRole.objects.filter(user=request.user, course__pk=question.course.pk, role__permissions__codename='delete_question').exists()

class SubVarForQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('sub var question')
        if request.user.is_staff:
            return True
        pk = request.data.get('id', None)
        print(pk)
        if pk is not None:
            if Question.objects.filter(pk=int(pk), owner=request.user, course=None).exists():
                print('my question')
                return True
            print('in course')
            return UserRole.objects.filter(user=request.user, course=request.data['course'], role__permissions__codename='change_question').exists()
        print('can view qbank')
        return request.user.can_view_questionbank()
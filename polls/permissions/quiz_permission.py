from rest_framework import permissions
from django.contrib.auth.models import Permission
from polls.models import Course, UserRole, Question


class EditQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('edit quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='change_quiz')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
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
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='view_quiz')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

class CreateQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('create quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='add_quiz')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

class DeleteQuiz(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('delete quiz')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='delete_quiz')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False
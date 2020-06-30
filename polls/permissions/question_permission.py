from rest_framework import permissions
from django.contrib.auth.models import Permission
from polls.models import Course, UserRole, Question


class EditQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('edit question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='change_question')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        else:
            pk = dict(view.kwargs).get('pk', None)
            question = Question.objects.get(pk=int(pk))
            if question.course is None:
                return request.user == question.owner
            try:
                role = UserRole.objects.get(user=request.user, course=question.course).role
                perm = Permission.objects.get(codename='change_question')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

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
            pk = dict(request.query_params).get('courses[]', None)
            if pk is not None:
                pk = int(pk[0])
        if pk is None:
            pk = dict(view.kwargs).get('pk', None)
            if pk is not None:
                course = Question.objects.get(pk=int(pk)).course
                if course is None:
                    # View question in user questionbank
                    return request.user == Question.objects.get(pk=int(pk)).owner
        else:
            course = Course.objects.get(pk=pk)
        if pk is not None:
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='view_question')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

class CreateQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('create question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        perm = Permission.objects.get(codename='add_question')
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).values('role')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        else:
            if UserRole.objects.filter(user=request.user, role__permissions=perm).exists():
                return True

        return False

class DeleteQuestion(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        print('delete question')
        if request.user.is_staff:
            return True
        pk = request.data.get('course', None)
        if pk is None:
            pk = dict(view.kwargs).get('pk', None)
            if pk is not None:
                course = Question.objects.get(pk=int(pk)).course
                if course is None:
                    # View question in user questionbank
                    return request.user == Question.objects.get(pk=int(pk)).owner
        if pk is not None:
            course = Course.objects.get(pk=pk)
            try:
                role = UserRole.objects.get(user=request.user, course=course).role
                perm = Permission.objects.get(codename='delete_question')
                if perm in role.permissions.all():
                    return True
            except UserRole.DoesNotExist:
                pass
        return False

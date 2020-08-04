
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, serializers
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response as HttpResponse
from polls.models import Question, Course, UserRole
from polls.serializers import *
from polls.permissions import IsInstructorOrAdmin, QuestionBank, ViewQuestion, EditQuestion, CreateQuestion, DeleteQuestion


def copy_a_question(question, course=None):
    serializer = QuestionSerializer(question)
    question_data = serializer.data
    if 'course' in question_data:
        question_data.pop('owner')
    else:
        question_data['owner'] = question_data['owner']['id']
    question_data['course'] = course
    for resp in question_data['responses']:
        resp['question'] = None
    serializer = QuestionSerializer(data=question_data)
    if serializer.is_valid():
        question = serializer.save()
        return question
    else:
        return serializers.ValidationError(serializer.errors)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def create(self, request):
        '''
        POST /question/
        permission: admin or instructor
        '''
        course = request.data.get('course',None)
        if course is None:
            request.data['owner'] = request.user.id
        elif 'owner' in request.data:
            request.data.pop('owner')
        if 'author' not in request.data:
            request.data['author'] = str(request.user)
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.save()
            data = QuestionSerializer(question).data
            return HttpResponse(status=200, data={'status': 'success', 'question': data})
        else:
            return HttpResponse(status=400, data=serializer.errors)

    def list(self, request):
        '''
        GET /question/
        permission: admin or instructor
        '''
        if request.user.is_staff:
            if request.query_params.get('courses[]', {}):
                data = Question.objects.filter(course__id=int(request.query_params.get('courses[]', {})[0]))
            else:
                data = Question.objects.all()
            length = len(data)
        else:
            data, length = Question.objects.with_query(**self.request.query_params)
            mod = Question.objects.all().exclude(course=None).union(Question.objects.filter(owner=request.user))
            data = set(data).intersection(mod)
            length = len(data)
        serializer = QuestionSerializer(data, many=True)
        return HttpResponse({'status': 'success', 'questions': serializer.data, "length": length})

    def destroy(self, request, pk=None):
        '''
        DELETE /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = Question.objects.get(pk=pk)
        if request.user.is_staff:
            question.delete()
            return HttpResponse(status=200)
        elif question.owner == request.user:
            question.delete()
            return HttpResponse(status=200)
        elif UserRole.objects.filter(user=request.user, course=question.course, role__permissions__codename='delete_question').exists():
            question.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403)

    def retrieve(self, request, pk=None):
        '''
        GET /question/{id}/
        permission: admin or instructor
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = get_object_or_404(Question, pk=pk)
        if not request.user.is_staff and question.owner and question.owner.pk != request.user.pk:
            return HttpResponse(status=403)
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def update(self, request, pk=None, **kwargs):
        '''
        POST /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = get_object_or_404(Question, pk=pk)
        if not request.user.is_staff and question.owner and question.owner.pk != request.user.pk:
            return HttpResponse(status=403)
        response = super().update(request, pk=pk, **kwargs)
        response.data = {'status': 'success', 'question': response.data}
        return response

    @action(detail=True, methods=['get'])
    def user_question_list(self, request, pk=None):
        '''
        GET /userprofile/{pk}/question/
        permission: admin or instructor
        TODO fix permission, find where this is used
        '''
        if str(request.query_params.get("exclude_course", None)) == "1":
            questions = Question.objects.filter(owner=pk, course__id=None)
        else:
            questions = Question.objects.filter(owner=pk)
        serializer = QuestionSerializer(questions, many=True)
        return HttpResponse({'status': 'success', 'questions': serializer.data, "length": len(serializer.data)})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        permission_classes = [IsInstructorOrAdmin]
        if self.action == 'list':
            permission_classes = [QuestionBank]
        elif self.action == 'retrieve':
            permission_classes = [ViewQuestion]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [EditQuestion]
        elif self.action == 'create':
            permission_classes = [CreateQuestion]
        elif self.action == 'destroy':
            permission_classes = [DeleteQuestion]
        else:
            permission_classes = [IsInstructorOrAdmin]
        return [permission() for permission in permission_classes]

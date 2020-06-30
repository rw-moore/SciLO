
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, serializers
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response as HttpResponse
from polls.models import Question, Course
from polls.serializers import *
from polls.permissions import IsInstructorOrAdmin, QuestionBank, ViewQuestion, EditQuestion, CreateQuestion, DeleteQuestion


def copy_a_question(question, course=None):
    serializer = QuestionSerializer(question)
    question_data = serializer.data
    question_data['owner'] = question_data['owner']['id']
    question_data['course'] = course
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
        courses_id = dict(request.query_params).get('courses[]', [])
        courses = Course.objects.filter(pk__in=courses_id)
        if courses.count() == 0 and 'course' not in request.data:
            request.data['owner'] = request.user.id
        if 'author' not in request.data:
            request.data['author'] = str(request.user)
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.save()
            data = QuestionSerializer(question).data
            for course in courses:
                question = copy_a_question(question, course=course.id)
            return HttpResponse(status=200, data={'status': 'success', 'question': data})
        else:
            return HttpResponse(status=400, data=serializer.errors)

    def list(self, request):
        '''
        GET /question/
        permission: admin or instructor
        '''
        if request.user.is_staff:
            print(request.query_params)
            if request.query_params.get('courses[]', {}):
                data = Question.objects.filter(course__id=int(request.query_params.get('courses[]', {})[0]))
            else:
                data = Question.objects.all()
            length = len(data)
        else:
            data, length = Question.objects.with_query(**self.request.query_params)
        serializer = QuestionSerializer(data, many=True)
        return HttpResponse({'status': 'success', 'questions': serializer.data, "length": length})

    def destroy(self, request, pk=None):
        '''
        DELETE /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = Question.objects.get(pk=pk)
        if request.user.is_staff or question.owner.pk == request.user.pk:
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
        request.data['owner'] = request.user.id
        question = get_object_or_404(Question, pk=pk)
        if not request.user.is_staff and question.owner and question.owner.pk != request.user.pk:
            return HttpResponse(status=403)
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def update(self, request, pk=None, **kwargs):
        '''
        POST /question/{id}/
        permission: admin or instructor(ownner)
        '''
        request.data['owner'] = request.user.id
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

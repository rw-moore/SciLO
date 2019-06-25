
from rest_framework import viewsets
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.models import Question
from polls.serializers import *


class QuestionViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def create(self, request):
        '''
        POST /question/
        '''
        response = super().create(request)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def list(self, request):
        '''
        GET /question/
        '''
        if len(self.request.query_params) == 0:
            serializer = QuestionSerializer(self.queryset, many=True)
            return Response({'status': 'success', 'questions': serializer.data, "length": len(serializer.data)})
        else:
            data, length = Question.objects.with_query(**self.request.query_params)
            serializer = QuestionSerializer(data, many=True)
            return Response({'status': 'success', 'questions': serializer.data, "length": length})


    def destroy(self, request, pk=None):
        '''
        DELETE /question/{id}/
        '''
        Question.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def retrieve(self, request, pk=None):
        '''
        GET /question/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /question/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def update(self, request, pk=None, **kwargs):
        '''
        POST /question/{id}/
        '''
        response = super().update(request, pk=pk, **kwargs)
        response.data = {'status': 'success', 'question': response.data}
        return response

    @action(detail=True, methods=['get'])
    def user_question_list(self, request, pk=None):
        '''
        GET /userprofile/{pk}/question/
        '''
        questions = self.queryset.filter(author=pk)
        serializer = QuestionSerializer(questions, many=True)
        return Response({'status': 'success', 'questions': serializer.data, "length": len(serializer.data)})

    @action(detail=True, methods=['get'])
    def quiz_question_list(self, request, pk=None):
        '''
        GET /quiz/{pk}/question/
        '''
        questions = self.queryset.filter(quiz=pk)
        serializer = QuestionSerializer(questions, many=True)
        return Response({'status': 'success', 'questions': serializer.data, "length": len(serializer.data)})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [IsAdminUser]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        elif self.action == 'list':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

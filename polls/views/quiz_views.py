from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.models import Quiz
from polls.serializers import *


def group_quiz_by_status(quizzes):
    results = {'done': [], 'processing': [], 'not_begin': []}
    for quiz in quizzes:
        if quiz['status'] == 'late':
            quiz['late'] = True
            results['processing'].append(quiz)
        else:
            results[quiz['status']].append(quiz)
    return results


class QuizViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def create(self, request):
        '''
        POST /quiz/
        # '''
        response = super().create(request)
        response.data = {'status': 'success', 'quiz': response.data}
        return response

    def list(self, request):
        '''
        GET /quiz/
        '''
        # response = super().list(request)
        serializer = QuizSerializer(
            Quiz.objects.all(), context={'question_detail': False, 'author_detail': False}, many=True)
        data = {
            'status': 'success',
            'quizzes': group_quiz_by_status(serializer.data),
            "length": len(serializer.data)}
        return Response(status=200, data=data)

    def destroy(self, request, pk=None):
        '''
        DELETE /quiz/{id}/
        '''
        quiz = get_object_or_404(Quiz, pk=pk)
        quiz.delete()
        return Response({'status': 'success'})

    def retrieve(self, request, pk=None):
        '''
        GET /quiz/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'quiz': response.data}
        return response

    def partial_update(self, request, pk=None, **kwargs):
        '''
        POST /question/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'quiz': response.data}
        return response

    def update(self, request, pk=None, **kwargs):
        '''
        POST /question/{id}/
        '''
        response = super().update(request, pk=pk, **kwargs)
        response.data = {'status': 'success', 'quiz': response.data}
        return response

    @action(detail=True, methods=['get'])
    def user_quiz_list(self, request, pk=None):
        '''
        GET /userprofile/{pk}/quiz/
        '''
        quizzes = self.queryset.filter(author=pk)
        serializer = QuizSerializer(quizzes, many=True)
        return Response({'status': 'success', 'quizzes': serializer.data, "length": len(serializer.data)})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permissions = [IsAdminUser]
        elif self.action == 'destroy':
            permissions = [IsAdminUser]
        elif self.action == 'list':
            permissions = [IsAdminUser]
        else:
            permissions = [IsAuthenticated]
        return [permission() for permission in permissions]

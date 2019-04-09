from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import (
    action,
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from polls.serializers import *
from polls.models import Quiz


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
        response = super().list(request)
        response.data = {'status': 'success', 'quizzes': response.data}
        return response

    # @action(detail=True, methods=['delete'])
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

    def partial_update(self, request, pk=None):
        '''
        POST /question/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'quiz': response.data}
        return response

    @action(detail=True, methods=['get'])
    def category_quiz_list(self, request, pk=None):
        '''
        GET /category/{pk}/quiz/
        '''
        quizzes = self.queryset.filter(category=pk)
        serializer = QuizSerializer(quizzes)
        return Response({'status': 'success', 'quizzes': serializer.data})

    @action(detail=True, methods=['get'])
    def user_quiz_list(self, request, pk=None):
        '''
        GET /userprofile/{pk}/quiz/
        '''
        quizzes = self.queryset.filter(author=pk)
        serializer = QuizSerializer(quizzes, many=True)
        return Response({'status': 'success', 'quizzes': serializer.data})

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

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.models import QuizAttempt
from polls.serializers import *


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer

    def create(self, request):
        '''
        POST /quiz-attempt/
        '''
        response = super().create(request)
        response.data = {'status': 'success', 'quiz_attempt': response.data}
        return response

    def list(self, request):
        '''
        GET /quiz-attempt/
        '''
        response = super().list(request)
        response.data = {'status': 'success', 'quiz_attempts': response.data, "length": len(response.data)}
        return response

    def destroy(self, request, pk=None):
        '''
        DELETE /quiz-attempt/{id}/
        '''
        QuizAttempt.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def retrieve(self, request, pk=None):
        '''
        GET /quiz-attempt/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'quiz_attempt': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /quiz-attempt/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'quiz_attempt': response.data}
        return response

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

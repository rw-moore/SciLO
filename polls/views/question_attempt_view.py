from rest_framework import viewsets
from rest_framework import response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.serializers import *
from polls.models import QuestionAttempt


class QuestionAttemptViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = QuestionAttempt.objects.all()
    serializer_class = QuestionAttemptSerializer

    def create(self, request):
        '''
        POST /question-attempt/
        '''
        # response = super().create(request)
        # response.data = {'status': 'success', 'question_attempt': response.data}
        # return response
        return response.Response({'status': 'False'}, status=405)

    def list(self, request):
        '''
        GET /question-attempt/
        '''
        # response = super().list(request)
        # response.data = {'status': 'success', 'question_attempts': response.data}
        return response.Response({'status': 'False'}, status=405)

    # @action(detail=True, methods=['delete'])
    def destroy(self, request, pk=None):
        '''
        DELETE /question-attempt/{id}/
        '''
        # QuestionAttempt.objects.get(pk=pk).delete()
        return response.Response({'status': 'False'}, status=405)

    def retrieve(self, request, pk=None):
        '''
        GET /question-attempt/{id}/
        '''
        # response = super().retrieve(request, pk=pk)
        # response.data = {'status': 'success', 'question_attempt': response.data}
        return response.Response({'status': 'False'}, status=405)

    def partial_update(self, request, pk=None):
        '''
        # POST /question-attempt/{id}/
        # '''
        # response = super().partial_update(request, pk=pk)
        # response.data = {'status': 'success', 'question_attempt': response.data}
        return response.Response({'status': 'False'}, status=405)

    def update(self, request, pk=None):
        return response.Response({'status': 'False'}, status=405)

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

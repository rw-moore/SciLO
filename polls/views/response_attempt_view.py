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
from polls.models import ResponseAttempt
from polls.controller import GradingController

class ResponseAttemptViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = ResponseAttempt.objects.all()
    serializer_class = ResponseAttemptSerializer

    def create(self, request):
        '''
        POST /response-attempt/
        '''
        response = super().create(request)
        
        gc = GradingController(response.data)
        gc.run()
        response_attempt = get_object_or_404(ResponseAttempt, pk=response.data['id'])
        serializer = ResponseAttemptSerializer(response_attempt)
        response.data = {'status': 'success', 'response-attempt': serializer.data}
        return response
   
    def list(self, request):
        '''
        GET /response-attempt/
        '''
        response = super().list(request)
        response.data = {'status': 'success', 'response-attempts': response.data, "length": len(response.data)}
        return response

    def destroy(self, request, pk=None):
        '''
        DELETE /response-attempt/{id}/
        '''
        ResponseAttempt.objects.get(pk=pk).delete()
        return Response({'status': 'True'}, status=200)

    def retrieve(self, request, pk=None):
        '''
        GET /response-attempt/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'response-attempt': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /response-attempt/{id}/
        '''
        # response = super().partial_update(request, pk=pk)
        # response.data = {'status': 'false', 'response-attempt': response.data}
        return Response({'status': 'False'}, status=405)

    def update(self, request, pk=None):
        return Response({'status': 'False'}, status=405)

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

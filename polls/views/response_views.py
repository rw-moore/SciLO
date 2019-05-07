from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.serializers import *
from polls.models import Response


class ResponseViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer

    def create(self, request):
        '''
        POST /response/
        '''
        response = super().create(request)
        response.data = {'status': 'success', 'response': response.data}
        return response

    def list(self, request):
        '''
        GET /response/
        '''
        response = super().list(request)
        response.data = {'status': 'success', 'responses': response.data, "length": len(response.data)}
        return response

    def destroy(self, request, pk=None):
        '''
        DELETE /response/{id}/
        '''
        response = super().destroy(request, pk)
        response.data = {'status': 'success'}
        return response

    def retrieve(self, request, pk=None):
        '''
        GET /response/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'response': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /response/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'response': response.data}
        return response

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

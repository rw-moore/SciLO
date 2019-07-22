from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from polls.serializers import *


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request):
        '''
        POST /userprofile/
        '''
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=200, data={'status': 'success', 'user': serializer.data})
        else:
            return Response(status=400, data={'status': 'false', 'errors': serializer.errors})

    def list(self, request):
        '''
        GET /userprofiles/
        '''
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(status=200, data={'status': 'success', 'users': serializer.data, "length": len(serializer.data)})

    def retrieve(self, request, pk=None):
        '''
        GET /userprofile/{id}/
        '''
        queryset = User.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        serializer = UserSerializer(user)
        return Response({'status': 'success', 'user': serializer.data})

    def partial_update(self, request, pk=None):
        '''
        POST /userprofile/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'user': response.data}
        return response

    def destroy(self, request, pk=None):
        '''
        DELETE /userprofile/{id}/
        '''
        User.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def set_password(self, request, pk=None):
        user = get_object_or_404(User.objects.all(), pk=pk)
        if request.data['password']:
            user.password = make_password(request.data['password'])
            user.save()
        return Response(status=200, data={'status': 'success'})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            permission_classes = [IsAdminUser, IsAuthenticated]
        elif self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

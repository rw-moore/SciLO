from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
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
        serializer = UserSerializer(User.objects.all(), many=True)
        return Response(status=200, data={'status': 'success', 'users': serializer.data, "length": len(serializer.data)})

    def retrieve(self, request, pk=None):
        '''
        GET /userprofile/{id}/
        '''
        user = get_object_or_404(User.objects.all(), pk=pk)
        serializer = UserSerializer(user)
        return Response({'status': 'success', 'user': serializer.data})

    def retrieve_by_username(self, request, username=None):
        '''
        GET /userprofile/{id}/
        '''
        user = get_object_or_404(User.objects.all(), username=username)
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

    def set_password(self, request, username=None):
        user = get_object_or_404(User.objects.all(), username=username)
        if request.data['password']:
            try:
                validate_password(request.data['password'])
            except ValidationError as error:
                return Response(status=400, data={"password": list(error)})
            user.password = make_password(request.data['password'])
            user.save()
        return Response(status=200, data={'status': 'success'})

    def check_username(self, request, username=None):
        if User.objects.filter(username=username).exists():
            return Response(status=200, data={'exists': True})
        else:
            return Response(status=200, data={'exists': False})

    def login(self, request):
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        if username is None or password is None:
            return Response(status=400, data={'message': 'username or password is None'})
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            if user.check_password(password):
                serializer = UserSerializer(user)
                # if no token, generate a new token
                if not Token.objects.filter(user=user).exists():
                    Token.objects.create(user=user)
                return Response({'token': Token.objects.get(user=user).key, 'user': serializer.data})
            else:
                return Response(status=400, data={'message': 'Username or password is incorrect'})
        else:
            return Response(status=400, data={'message': 'Username or password is incorrect'})

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
        elif self.action == 'check_username':
            permission_classes = [AllowAny]
        elif self.action == 'login':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

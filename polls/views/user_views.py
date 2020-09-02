from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests
from polls.serializers import *
from polls.models import UserProfile, AuthMethod
from api.settings import CLIENT_ID, GSUITE_DOMAIN_NAMES


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = UserProfile.objects.all()
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
        serializer = UserSerializer(UserProfile.objects.all(), many=True)
        return Response(status=200, data={'status': 'success', 'users': serializer.data, "length": len(serializer.data)})

    def retrieve(self, request, pk=None):
        '''
        GET /userprofile/{id}/
        '''
        user = get_object_or_404(UserProfile.objects.all(), pk=pk)
        serializer = UserSerializer(user, context={'userprofile':True})
        return Response({'status': 'success', 'user': serializer.data})

    def retrieve_by_username(self, request, username=None):
        '''
        GET /userprofile/{id}/
        '''
        user = get_object_or_404(UserProfile.objects.all(), username=username)
        serializer = UserSerializer(user, context={'userprofile':True})
        return Response({'status': 'success', 'user': serializer.data})

    def partial_update(self, request, pk=None):
        '''
        POST /userprofile/{id}/
        '''
        if str(pk) != str(request.user.id) and not request.user.is_staff:
            return Response(status=403, data={"message": "you have no permission to update this account"})
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'user': response.data}
        return response

    def destroy(self, request, pk=None):
        '''
        DELETE /userprofile/{id}/
        '''
        UserProfile.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def set_password(self, request, username=None):
        if str(username) != str(request.user.username) and not request.user.is_staff:
            return Response(status=403, data={"message": "you have no permission to update this account"})
        user = get_object_or_404(UserProfile.objects.all(), username=username)
        if request.data['password']:
            try:
                validate_password(request.data['password'])
            except ValidationError as error:
                return Response(status=400, data={"password": list(error)})
            user.password = make_password(request.data['password'])
            user.save()
        return Response(status=200, data={'status': 'success'})

    def check_username(self, request, username=None):
        if UserProfile.objects.filter(username=username).exists():
            return Response(status=200, data={'exists': True})
        else:
            return Response(status=200, data={'exists': False})

    def check_email(self, request, email=None):
        if UserProfile.objects.filter(email=email).exists():
            return Response(status=200, data={'exists': True})
        else:
            return Response(status=200, data={'exists': False})

    def login(self, request):
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        if username is None or password is None:
            return Response(status=400, data={'message': 'username or password is None'})
        if UserProfile.objects.filter(username=username).exists():
            user = UserProfile.objects.get(username=username)
            if AuthMethod.objects.get(method='Username/Password') in user.auth_methods.all():
                if user.check_password(password):
                    serializer = UserSerializer(user, context={'userprofile':True})
                    # if no token, generate a new token
                    if not Token.objects.filter(user=user).exists():
                        Token.objects.create(user=user)
                    return Response({'token': Token.objects.get(user=user).key, 'user': serializer.data})
                else:
                    return Response(status=401, data={'message': 'Username or password is incorrect'})
            else:
                return Response(status=401, data={'message': 'Could not authenticate with username and passord'})
        else:
            return Response(status=401, data={'message': 'Username or password is incorrect'})

    def googlelogin(self, request):
        token = request.data.get("id_token", None)
        email = request.data.get("email", None)
        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

            # Or, if multiple clients access the backend server:
            # idinfo = id_token.verify_oauth2_token(token, requests.Request())
            # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
            #     raise ValueError('Could not verify audience.')

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            # If auth request is from a G Suite domain:
            if idinfo['hd'] not in GSUITE_DOMAIN_NAMES:
                return Response(status=401, data={'message': 'Email is not from a recognized Domain'})

            # ID token is valid. Get the user's Google Account ID from the decoded token.
            # userid = idinfo['sub']
            if email is not None:
                if UserProfile.objects.filter(email=email).exists():
                    user = UserProfile.objects.get(email=email)
                    if AuthMethod.objects.get(method='Google') in user.auth_methods.all():
                        serializer = UserSerializer(user, context={'userprofile':True})
                        if not Token.objects.filter(user=user).exists():
                            Token.objects.create(user=user)
                        return Response(status=200, data={'token': Token.objects.get(user=user).key, 'user': serializer.data})
                    else:
                        return Response(status=401, data={'message': 'Could not authenticate with the google account'})
                else:
                    # Redirect to register form
                    return Response(status=303, data={'message': 'Account does not exist'})
            return Response(status=401, data={'message': 'Username or password is incorrect'})
        except ValueError:
            # Invalid token
            pass
        return Response(status=400, data={"message":"Could not verify token"})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            permission_classes = [IsAdminUser]
        elif self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        elif self.action in ['check_username', 'check_email']:
            permission_classes = [AllowAny]
        elif self.action in ['login', 'googlelogin']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

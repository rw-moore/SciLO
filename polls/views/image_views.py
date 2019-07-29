import mimetypes
import os
from wsgiref.util import FileWrapper
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.response import Response as rest_response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from polls.models import User


class AvatarView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk=None):
        if request.user.is_anonymous:
            return rest_response(status=401)
        if str(request.user.pk) != str(pk) and not request.user.is_superuser:
            return rest_response(status=403)
        user = get_object_or_404(User.objects.all(), pk=pk)
        user.profile.avatar = request.data.get('avatar')
        user.profile.save()
        return rest_response({'status': 'success'})

    def delete(self, request, pk=None):
        if request.user.is_anonymous:
            return rest_response(status=401)
        if str(request.user.pk) != str(pk) and not request.user.is_superuser:
            return rest_response(status=403)
        user = get_object_or_404(User.objects.all(), pk=pk)
        if user.profile.avatar:
            user.profile.avatar.delete()
            return rest_response({'status': 'success'})
        return rest_response({'status': 'success'})

    def get(self, request, pk):
        user = get_object_or_404(User.objects.all(), pk=pk)
        if user.profile.avatar:
            path = user.profile.avatar.path
            wrapper = FileWrapper(open(path, 'rb'))
            content_type = mimetypes.guess_type(path)[0]
            response = HttpResponse(wrapper, content_type=content_type)
            response['Content-Length'] = os.path.getsize(path)
            response['Content-Disposition'] = "attachment; filename={}".format(path)
            return response
        else:
            return rest_response(status=404, data={'message': 'no avatar'})

    def get_queryset(self):
        return User.objects.all()

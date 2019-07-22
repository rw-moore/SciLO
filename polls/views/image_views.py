import mimetypes
import os
from wsgiref.util import FileWrapper
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_avatar(request, path):
    wrapper = FileWrapper(open('storage/'+path, 'rb'))
    content_type = mimetypes.guess_type('storage/'+path)[0]
    response = HttpResponse(wrapper, content_type=content_type)
    response['Content-Length'] = os.path.getsize('storage/'+path)
    response['Content-Disposition'] = "attachment; filename={}".format(path)
    return response

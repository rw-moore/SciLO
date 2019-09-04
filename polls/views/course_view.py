from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions
from django.shortcuts import get_object_or_404
from polls.models import Course
from polls.serializers import CourseSerializer


@api_view(['POST', 'GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def create_course(request):
    if request.method == 'GET':
        serializer = CourseSerializer(
            Course.objects.all(),
            context={
                'groups_context': {
                    "fields": ["id", "name"],
                    "users_context": {
                        "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                    }
                }
            },
            many=True)
        return HttpResponse(serializer.data)
    elif request.method == 'POST':
        fullname = request.data.get('fullname', None)
        shortname = request.data.get('shortname', None)
        if fullname and shortname:
            course = Course.objects.create(fullname=fullname, shortname=shortname)
            serializer = CourseSerializer(
                course,
                context={
                    'groups_context': {
                        "fields": ["id", "name"],
                        "users_context": {
                            "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                        }
                    }
                })
            return HttpResponse(serializer.data)
        else:
            return HttpResponse(status=400, data={"message": 'required fields: fullname and shortname'})


@api_view(['DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def delete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    course.delete()
    return HttpResponse(status=200)

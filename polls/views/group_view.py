from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication
from django.db.utils import IntegrityError
from django.shortcuts import get_object_or_404
from polls.models import UserProfile, Course, Role
from polls.serializers import GroupSerializer, CourseSerializer
from polls.permissions import IsInstructorInCourse

@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def add_delete_users_to_group(request, course_id, group_id):
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message": 'required filed: users'})


    course = get_object_or_404(Course, pk=course_id)
    group_qs = course.groups.filter(pk=group_id)
    if len(group_qs) == 1:
        group = group_qs[0]
    else:
        return HttpResponse(status=400, data={"msg": "course does not have this group"})

    if request.query_params.get('username', False):
        users = UserProfile.objects.filter(username__in=uids)
    else:
        users = UserProfile.objects.filter(pk__in=uids)  # get all users via uids

    if request.method == 'POST':
        group.user_set.add(*users)
        for user in users:
            rolestring = group.name.split('_')[2]
            for role in Role.ROLE_CHOICES:
                if rolestring == role[1]:
                    Role.objects.create(user=user, course=course, role=role[0])
    elif request.method == 'DELETE':
        group.user_set.remove(*users)
        for user in users:
            Role.object.delete(user=user, course=course)
    group.save()
    serializer = GroupSerializer(group, context={"fields": ["id", "name", "users"], "users_context": {
        "fields": ['id', 'username', 'first_name', 'last_name', 'email']}})
    return HttpResponse(status=200, data=serializer.data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def create_group_to_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    name = request.data.get('name', None)
    if name is None:
        return HttpResponse(status=400, data={"msg": "name field is requried"})
    if request.method == 'POST':
        try:
            course.create_group(name)
        except IntegrityError as e:
            return HttpResponse(status=400, data={"msg": str(e)})


        serializer = CourseSerializer(
            course,
            context={
                'question_context': {
                    'fields': ['id', 'title'],
                },
                'groups_context': {
                    "fields": ["id", "name", 'users'],
                    "users_context": {
                        "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                    }
                }
            })
        return HttpResponse(status=200, data=serializer.data)


@api_view(['DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def delete_group(request, course_id, group_id):
    course = get_object_or_404(Course, pk=course_id)
    group_qs = course.groups.filter(pk=group_id)
    if len(group_qs) == 1:
        group = group_qs[0]
        if len(group.name) >= 7 and group.name[:7] == 'COURSE_':
            return HttpResponse(status=403,
                                data={"msg": "you can not delete " \
                                      + group.name + " please delete the course responding to it"})
        group.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400, data={"msg": "course does not have this group"})

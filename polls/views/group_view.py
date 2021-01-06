from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework.permissions import IsAdminUser
from rest_framework import authentication
from django.db.utils import IntegrityError
from django.shortcuts import get_object_or_404
from polls.models import UserProfile, Course, Role, UserRole
from polls.serializers import CourseSerializer
from polls.permissions import IsInstructorInCourse

@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def add_delete_users_to_group(request, course_id, group_id):
    """
    permissions: admin can add/ delete users to any course
    instructor can add/ delete users to courses they instruct
    """
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message": 'required field: users'})

    course = get_object_or_404(Course, pk=course_id)
    role = get_object_or_404(Role, pk=group_id)
    if request.query_params.get('username', False):
        users = UserProfile.objects.filter(username__in=uids)
    else:
        users = UserProfile.objects.filter(pk__in=uids)  # get all users via uids
    if request.method == 'POST':
        for user in users:
            try:
                UserRole.objects.create(user=user, course=course, role=role)
            except IntegrityError:
                return HttpResponse(status=403, data={"msg": "User already has a role for this course"})
    elif request.method == 'DELETE':
        UserRole.objects.filter(user__in=users, course=course).delete()

    return HttpResponse(status=200)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsAdminUser])
def create_group_to_course(request, pk):
    """
    permissions: admin can create groups for any course
    """
    course = get_object_or_404(Course, pk=pk)
    name = request.data.get('name', None)
    # print(request.data)
    if name is None:
        return HttpResponse(status=400, data={"msg": "name field is requried"})
    if request.method == 'POST':
        # try:
        #     course.create_group(name)
        #     course.groups.get(name=course.shortname+'_'+name).permissions.set([]) # get from request.data when tianqi can add it
        # except IntegrityError as e:
        #     return HttpResponse(status=400, data={"msg": str(e)})
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
@permission_classes([IsAdminUser])
def delete_group(request, course_id, group_id):
    """
    permissions: admin can delete groups for any course
    instructor can delete from courses they instruct
    """
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

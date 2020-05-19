from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from django.db.models import Q
from polls.models import Course, UserProfile, Question
from polls.serializers import CourseSerializer
from polls.permissions import InCourse, IsInstructorInCourse, IsAdministrator
from .question_views import copy_a_question

def find_user_courses(user):
    groups = user.groups.filter(Q(name__contains='COURSE_'))
    courses = Course.objects.none()
    for g in groups:
        courses = courses.union(g.course_set.all())
    return courses


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_courses(request):

    if request.user.is_admin:
        courses = Course.objects.all()
    else:
        courses = find_user_courses(request.user)
    serializer = CourseSerializer(
        courses,
        context={
            'question_context': {
                'fields': ['id', 'title'],
            },
            'groups_context': {
                "fields": ["id", "name", "users"],
                "users_context": {
                    "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                }
            }
        },
        many=True)
    return HttpResponse(serializer.data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated|IsAdministrator])
def create_a_course(request):
    fullname = request.data.get('fullname', None)
    shortname = request.data.get('shortname', None)
    if fullname and shortname:
        course = Course.objects.create(fullname=fullname, shortname=shortname)
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
        return HttpResponse(serializer.data)
    else:
        return HttpResponse(status=400, data={"message": 'required fields: fullname and shortname'})


@api_view(['GET', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InCourse])
def get_or_delete_course(request, pk):
    user = request.user
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'DELETE':
        if user.is_staff:
            course.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403, data={"message": "you dont have permission to delete this course"})
    elif request.method == 'GET':
        serializer = CourseSerializer(
            course,
            context={
                'question_context': {
                    'fields': ['id', 'title'],
                },
                'groups_context': {
                    "fields": ["id", "name", "users"],
                    "users_context": {
                        "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                    }
                }
            })
        return HttpResponse(serializer.data)


@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def add_or_delete_student_to_course(request, pk):
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message": 'required filed: users'})
    course = get_object_or_404(Course, pk=pk)
    users = UserProfile.objects.filter(pk__in=uids)  # get all users via uids
    group = course.groups.get(name='COURSE_'+course.shortname+'_student_group')

    if request.method == 'POST':
        group.user_set.add(*users)
    elif request.method == 'DELETE':
        group.user_set.remove(*users)
    group.save()
    serializer = CourseSerializer(
        course,
        context={
            'question_context': {
                'fields': ['id', 'title'],
            },
            'groups_context': {
                "fields": ["id", "name", "users"],
                "users_context": {
                    "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                }
            }
        }
    )
    return HttpResponse(status=200, data=serializer.data)


@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def copy_or_delete_questions_to_course(request, course_id):
    '''
    permission: instructor in course's group
    copy and paste questions to course
    '''
    def validate_data(data):
        questions_id = data.get('questions', None)
        if questions_id is None or isinstance(questions_id, list) is False:
            raise serializers.ValidationError({"questions": "questions field is required and questions is a list"})
        return questions_id

    course = get_object_or_404(Course, pk=course_id)
    questions_id = validate_data(request.data)
    if request.method == 'POST':
        if request.user.is_staff:
            questions = Question.objects.filter(pk__in=questions_id).exclude(course__id=course_id)
        else:
            questions = Question.objects.filter(pk__in=questions_id, author=request.user).exclude(course__id=course_id)
        # course.questions.add(*questions)
        copy_questions = [copy_a_question(q) for q in questions]
        course.questions.add(*copy_questions)

    elif request.method == 'DELETE':
        questions = course.questions.filter(pk__in=questions_id, author=request.user, course__id=course_id)
        course.questions.remove(*questions)
    serializer = CourseSerializer(
        course,
        context={
            'question_context': {

            },
            'groups_context': {
                "fields": ["id", "name"],
                "users_context": {
                    "fields": ['id', 'username', 'first_name', 'last_name', 'email']
                }
            }
        })
    return HttpResponse(status=200, data=serializer.data)

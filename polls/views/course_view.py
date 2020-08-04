from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from polls.models import Course, UserProfile, Question, UserRole, Role
from polls.serializers import CourseSerializer
from polls.permissions import InCourse, CanSetEnrollmentRole
from .question_views import copy_a_question

def find_user_courses(user):
    print('find courses')
    if user.is_staff:
        courses = Course.objects.all()
    else:
        roles = UserRole.objects.filter(user=user)
        courses = [role.course for role in roles]
    return courses


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_courses(request):
    """
    permissions: admin can see all courses
    user can see all courses they are in
    """
    print('get courses')
    if request.user.is_staff:
        courses = Course.objects.all()
    else:
        courses = find_user_courses(request.user)
    # print(courses)
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
        }, many=True)
    # print(serializer.data)
    return HttpResponse(serializer.data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def create_a_course(request):
    """
    permissions: only admin can create a course
    """
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
    """
    permissions: admin can view/ delete any course
    user can get courses they are in
    """
    user = request.user
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'DELETE':
        if user.is_staff:
            course.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403, data={"message": "You dont have permission to delete this course"})
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
        # print(serializer.data)
        return HttpResponse(serializer.data)


@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InCourse])
def add_or_delete_student_to_course(request, pk):
    """
    permissions: admin can add or delete users to any course
    instructors can add/ delete users to courses they instruct
    """
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message": 'required field: users'})
    course = get_object_or_404(Course, pk=pk)
    users = UserProfile.objects.filter(pk__in=uids)  # get all users via uids

    if request.method == 'POST':
        # TO DO add check for having add user permission
        for user in users:
            print(user)
    elif request.method == 'DELETE':
        # TO DO add check for delete user permission
        pass
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
@permission_classes([InCourse])
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
            # TO DO add check for permission
            questions = Question.objects.filter(pk__in=questions_id, owner=request.user).exclude(course__id=course_id)
        # course.questions.add(*questions)
        copy_questions = [copy_a_question(q) for q in questions]
        course.questions.add(*copy_questions)

    elif request.method == 'DELETE':
        # TO DO add check for delete permissions
        questions = course.questions.filter(pk__in=questions_id, owner=request.user, course__id=course_id)
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

@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def enroll_in_course_by_code(request):
    """
    Anyone can enroll in a course if they know the key
    """
    secret_code = request.data.get("enroll_code", None)
    if secret_code:
        try:
            course = Course.objects.get(secret_code=secret_code)
        except Course.DoesNotExist:
            return HttpResponse(status=404, data={"message":"No course for that enrollment code"})
        user = request.user
        if not course.enroll_role:
            return HttpResponse(status=400, data={"message":"Instructor has not defined a default role for this course"})
        try:
            UserRole.objects.create(user=user, course=course, role=course.enroll_role)
            return HttpResponse(status=200)
        except IntegrityError:
            return HttpResponse(status=403, data={"msg": "User already has a role for this course"})
    return HttpResponse(status=400, data={"message": 'required field: secret_code'})


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([CanSetEnrollmentRole])
def set_default_enroll_role(request, course_id):
    """
    Users must have access_code permission to set a new default role
    """
    role_id = request.data.get("role", None)
    if role_id:
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return HttpResponse(status=404, data={"message":"Could not find course"})
        try:
            role = Role.objects.get(pk=int(role_id))
        except Role.DoesNotExist:
            return HttpResponse(status=404, data={"message":"Could not find role"})
        course.enroll_role = role
        course.save()
        return HttpResponse(status=200)
    return HttpResponse(status=400, data={"message": 'required field: role'})

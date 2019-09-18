from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from polls.models import Quiz, Question, Course
from polls.serializers import QuizSerializer, CourseSerializer
from polls.permissions import IsInstructor, IsInstructorOrAdmin, IsInstructorInCourse


@api_view(['GET', 'POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_or_quiz_by_couse_id(request, pk):
    '''
    permission: admin/in course's group
    if method is GET => return quizzes in such course
    if method is POST => create a quiz in such course
    '''
    return


@api_view(['PUT'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_quiz_by_id(request, pk):
    '''
    permission: admin/instuctor
    modify quiz if only if it does not have quiz-attempt
    '''
    return


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
        questions = Question.objects.filter(pk__in=questions_id, author=request.user)
        for question in questions:
            question.pk = None
            question.save()
        course.questions.add(*questions)
    elif request.method == 'DELETE':
        questions = course.questions.filter(pk__in=questions_id, author=request.user)
        course.questions.remove(*questions)
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
    return HttpResponse(status=200, data=serializer.data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def copy_questions_from_course(request, pk):
    '''
    permission: instructor in course's group
    copy and paste questions from course to self
    '''
    return


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_all_quiz(request, pk):
    '''
    permission: login
    if admin return all quizzes
    else return quizzes they can access
    '''
    return

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from polls.models import Quiz, Question, Course
from polls.serializers import QuizSerializer, CourseSerializer
from polls.permissions import IsInstructor, IsInstructorOrAdmin, IsInstructorInCourse, InCourse, QuizInCourse
from .course_view import find_user_courses


def find_user_quizzes(user):
    courses = find_user_courses(user)
    quizzes = Quiz.objects.none()
    for course in courses:
        quizzes = quizzes.union(course.quizzes.all())
    return quizzes


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorInCourse])
def create_a_quiz_by_couse_id(request, course_id):
    '''
    permission: admin/in course's group
    if method is POST => create a quiz in such course
    '''
    data = request.data
    data['course'] = course_id
    questions = data['questions']
    qids = []
    for question in questions:
        if question.get('id', None) and question.get('mark', None):
            qids.append(question['id'])
        else:
            HttpResponse(status=400)
    # validate questions belong to course
    if len(Question.objects.filter(course__pk=course_id, pk__in=qids)) != len(qids):
        raise serializers.ValidationError({"error": "there is some questions does not belong to course"})
    serializer = QuizSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
    else:
        HttpResponse(status=400, data=serializer.errors)
    return HttpResponse(status=200, data=serializer.data)


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
        course.questions.add(*questions)
    elif request.method == 'DELETE':
        questions = course.questions.filter(pk__in=questions_id, author=request.user)
        course.questions.remove(*questions)
    serializer = CourseSerializer(
        course,
        context={
            'question_context': {
                'fields': ['id', 'title'],
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
def get_all_quiz(request):
    '''
    permission: login
    if admin return all quizzes
    else return quizzes they can access
    '''
    user = request.user
    if user.is_staff:
        quizzes = Quiz.objects.all()
    else:
        quizzes = find_user_quizzes(user)
    serializer = QuizSerializer(quizzes, many=True, context={'exclude_fields': ['questions']})
    return HttpResponse(status=200, data=serializer.data)


@api_view(['GET', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([QuizInCourse, InCourse])
def get_or_delete_a_quiz(request, course_id, quiz_id):
    '''
    permission: in course
    '''
    user = request.user
    if request.method == 'DELETE':
        if user.is_staff or user.profile.is_instructor:  # if instructor or admin
            Quiz.objects.get(pk=quiz_id).delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403)
    elif request.method == 'GET':
        context = {}
        if not user.is_staff and not user.profile.is_instructor:  # if neither instructor or admin
            context['question_context'] = {'exclude_fields': ['responses', 'author', 'quizzes', 'course']}
        quiz = Quiz.objects.get(pk=quiz_id)
        serializer = QuizSerializer(quiz, context=context)
        return HttpResponse(status=200, data=serializer.data)

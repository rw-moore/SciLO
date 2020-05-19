from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from polls.models import Quiz, Question, Course, Role
from polls.serializers import QuizSerializer
from polls.permissions import InCourse, InQuiz, IsInstructorOrAdmin
from .course_view import find_user_courses
from .question_views import copy_a_question


def group_quiz_by_status(quizzes):
    results = {'done': [], 'processing': [], 'not_begin': []}
    for quiz in quizzes:
        if quiz['status'] == 'late':
            quiz['late'] = True
            results['processing'].append(quiz)
        else:
            results[quiz['status']].append(quiz)
    return results


def find_user_quizzes(user):
    courses = find_user_courses(user)
    quizzes = Quiz.objects.none()
    for course in courses:
        quizzes = quizzes.union(course.quizzes.all())
    return quizzes


def validate_quiz_questions(course_id, data, user):
    course = get_object_or_404(Course, pk=course_id)
    questions = data.get('questions', None)
    if questions is None:
        return data
    qids = {}
    for question in questions:
        question['mark'] = question.get('mark', 0)
        if question.get('id', None) is None:
            HttpResponse(status=400)
        else:
            qids[str(question['id'])] = question
    # validate questions belong to course
    instructor_not_course_questions = Question.objects.filter(
        author=user, pk__in=qids.keys()).exclude(course__id=course_id)
    questions_in_course = Question.objects.filter(pk__in=qids.keys(), course__id=course_id)

    questions = questions_in_course.union(instructor_not_course_questions)

    if len(questions) != len(qids):
        raise serializers.ValidationError({"error": "there is some questions does not belong to course and yourself"})

    copy_questions = []
    for question in instructor_not_course_questions:
        old_id = question.id
        new_question = copy_a_question(question, course=course_id)
        copy_questions.append(new_question)
        qids[str(old_id)]['id'] = new_question.id
    data['questions'] = qids.values()
    course.questions.add(*copy_questions)  # auto add question into course
    return data


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([IsInstructorOrAdmin])
def create_a_quiz_by_couse_id(request):
    '''
    permission: admin/in course's group
    if method is POST => create a quiz in such course
    '''
    data = request.data
    course_id = data.get('course', None)
    if course_id is None:
        return HttpResponse(status=400)

    validate_quiz_questions(course_id, data, request.user)

    serializer = QuizSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
    else:
        HttpResponse(status=400, data=serializer.errors)
    return HttpResponse(status=200, data=serializer.data)


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
    if request.query_params.get('group', None) == 'status':
        return HttpResponse(status=200, data=group_quiz_by_status(serializer.data))
    else:
        return HttpResponse(status=200, data=serializer.data)


@api_view(['GET', 'DELETE', 'PUT', 'PATCH'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InQuiz])
def get_or_delete_a_quiz(request, quiz_id):
    '''
    permission: in course
    '''
    user = request.user
    quiz = Quiz.objects.get(pk=quiz_id)
    data = request.data
    course_id = data.get('course', quiz.course.id)
    course = Course.objects.get(pk=course__id)
    user_role = Role.objects.get(user=user, course=course)
    if user_role.exists():
        raise Exception("User is not in course {}".format(course.shortname))

    if request.method == 'DELETE':
        if user.is_admin or (user_role==Role.INSTRUCTOR):  # if instructor or admin
            quiz.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403)
    elif request.method == 'GET':
        context = {}
        if not user.is_admin and not (user_role.role>Role.STUDENT):  # if neither instructor or admin
            context['question_context'] = {'exclude_fields': ['responses', 'author', 'quizzes', 'course']}
        serializer = QuizSerializer(quiz, context=context)
        return HttpResponse(status=200, data=serializer.data)
    elif request.method == 'PUT':
        if not user.is_admin and not (user_role.role>Role.STUDENT):  # if neither instructor or admin
            return HttpResponse(status=403)
        validate_quiz_questions(course_id, data, user)
        serializer = QuizSerializer(quiz, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
        else:
            return HttpResponse(status=400, data=serializer.errors)
        return HttpResponse(status=200, data=QuizSerializer(quiz).data)
    elif request.method == 'PATCH':
        if not user.is_admin and not (user_role.role>Role.STUDENT):  # if neither instructor or admin
            return HttpResponse(status=403)
        validate_quiz_questions(course_id, data, user)
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        return HttpResponse(status=200, data=QuizSerializer(quiz).data)


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InCourse])
def get_quizzes_by_course_id(request, course_id):
    '''
    permission: login
    return quizzes belongs to given course
    '''

    quizzes = Quiz.objects.filter(course__id=course_id)
    serializer = QuizSerializer(quizzes, many=True, context={'exclude_fields': ['questions']})
    return HttpResponse(status=200, data=serializer.data)

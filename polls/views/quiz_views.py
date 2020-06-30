from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Permission
from polls.models import Quiz, Question, Course, UserRole
from polls.serializers import QuizSerializer
from polls.permissions import InCourse, InQuiz, CreateQuiz
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
        role = get_object_or_404(UserRole, user=user, course=course).role
        overlap = role.permissions.all()
        perm = Permission.objects.get(codename='change_quiz')  # use "change_quiz" to see hidden quiz for now
        if not user.is_staff and perm not in overlap:  # if neither instructor or admin
            quizzes = quizzes.union(course.quizzes.filter(is_hidden=False))
        else:
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
        owner=user, pk__in=qids.keys()).exclude(course__id=course_id)
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
@permission_classes([CreateQuiz])
def create_a_quiz_by_course_id(request):
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
    permission: admin can get/ delete any quiz
    user can get a quiz they are in the course for
    '''
    user = request.user
    quiz = Quiz.objects.get(pk=quiz_id)
    data = request.data
    course_id = data.get('course', quiz.course.id)
    print(course_id)
    course = get_object_or_404(Course, pk=course_id)
    if not user.is_staff:
        role = get_object_or_404(UserRole, user=user, course=course).role
        overlap = role.permissions.all()

    if request.method == 'DELETE':
        perm = Permission.objects.get(codename='delete_quiz')
        if user.is_staff or perm in overlap:  # if admin has permission to delete quizzes
            quiz.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403)
    elif request.method == 'GET':
        perm = Permission.objects.get(codename='view_quiz')
        context = {}
        if not user.is_staff and perm not in overlap:  # if neither instructor or admin
            context['question_context'] = {'exclude_fields': ['responses', 'owner', 'quizzes', 'course']}
        serializer = QuizSerializer(quiz, context=context)
        return HttpResponse(status=200, data=serializer.data)
    elif request.method == 'PUT':
        perm = Permission.objects.get(codename='change_quiz')
        if not user.is_staff and perm not in overlap:  # if neither instructor or admin
            return HttpResponse(status=403)
        validate_quiz_questions(course_id, data, user)
        serializer = QuizSerializer(quiz, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
        else:
            return HttpResponse(status=400, data=serializer.errors)
        return HttpResponse(status=200, data=QuizSerializer(quiz).data)
    elif request.method == 'PATCH':  # TO FIX PATCH is_hidden ONLY, the old school method has bugs deleting all dates
        perm = Permission.objects.get(codename='change_quiz')
        if not user.is_staff and perm not in overlap:  # if neither instructor or admin
            return HttpResponse(status=403)

        # validate_quiz_questions(course_id, data, user)
        old = QuizSerializer(quiz).data
        hidden = request.data.get("is_hidden")
        if hidden is not None:
            old["is_hidden"] = hidden
            serializer = QuizSerializer(quiz, data=old, partial=False)
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
    if request.user.is_staff:
        quizzes = Quiz.objects.filter(course__id=course_id)
    else:
        role = get_object_or_404(UserRole, user=request.user, course=course_id).role
        overlap = role.permissions.all()
        perm = Permission.objects.get(codename='change_quiz')  # use "change_quiz" to see hidden quiz for now
        if not request.user.is_staff and perm not in overlap:  # if neither instructor or admin
            quizzes = Quiz.objects.filter(course__id=course_id, is_hidden=False)
        else:
            quizzes = Quiz.objects.filter(course__id=course_id)
    serializer = QuizSerializer(quizzes, many=True, context={'exclude_fields': ['questions']})

    return HttpResponse(status=200, data=serializer.data)

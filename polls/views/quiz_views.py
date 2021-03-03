from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Permission
from polls.models import Attempt, Quiz, Question, Course, UserRole
from polls.serializers import QuizSerializer
from polls.permissions import InCourse, InQuiz, CreateQuiz, InstructorInQuiz
from .course_view import find_user_courses
# from .question_views import copy_a_question


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
            quizzes = quizzes.union(course.quizzes.filter(options__is_hidden=False))
        else:
            quizzes = quizzes.union(course.quizzes.all())
    return quizzes


def validate_quiz_questions(course_id, data, user):
    # course = get_object_or_404(Course, pk=course_id)
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
        raise serializers.ValidationError({"error": "there is some questions does not belong to course or yourself"})

    # copy_questions = []
    # for question in questions:
    #     if not question.in_quiz:
    #         old_id = question.id
    #         new_question = copy_a_question(question, course=course_id)
    #         new_question.in_quiz = True
    #         new_question.save()
    #         copy_questions.append(new_question)
    #         qids[str(old_id)]['id'] = new_question.id
    data['questions'] = qids.values()
    # course.questions.add(*copy_questions)  # auto add question into course
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
    if 'author' not in request.data: # if you don't supply an author you are the author
        request.data['author'] = str(request.user)

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
    print('course: ', course_id)
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
            old["options"]['is_hidden'] = hidden
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
            quizzes = Quiz.objects.filter(course__id=course_id, options__is_hidden=False)
        else:
            quizzes = Quiz.objects.filter(course__id=course_id)
    serializer = QuizSerializer(quizzes, many=True, context={'exclude_fields': ['questions']})

    return HttpResponse(status=200, data=serializer.data)

@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InstructorInQuiz])
def get_quiz_attempts_and_grades(request, quiz_id):
    student = request.user
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    # decide how many attempts the user can view
    if request.user.is_staff:
        attempts = Attempt.objects.filter(quiz=quiz)
    elif quiz.options.get('is_hidden'):
        role = get_object_or_404(UserRole, user=request.user, course=quiz.course).role
        perm = Permission.objects.get(codename='change_quiz')
        if perm not in role.permissions.all():
            return HttpResponse(status=404)
        attempts = Attempt.objects.filter(quiz=quiz)
    else:
        if UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='view_others_attempts').exists():
            attempts = Attempt.objects.filter(quiz=quiz)
        elif UserRole.objects.filter(user=request.user, course=quiz.course).exists():
            attempts = Attempt.objects.filter(student=student, quiz=quiz)
        else:
            return HttpResponse(status=403, data={"message":"You do not have permission to view this quiz."})
    # gather the relevant data fill in 0s for grades we don't have
    # print(attempts)
    quiz_attempts = []
    for attempt in attempts:
        attempt_data = {
            'id': attempt.id,
            'user': attempt.student.get_full_name(),
            'last_name': attempt.student.last_name,
            'grade': attempt.quiz_attempts['grade'] or 0,
            'questions':[]
        }
        for quiz_q in quiz.questions.all():
            for q in attempt.quiz_attempts['questions']:
                if quiz_q.id == q['id']:
                    attempt_data['questions'].append({
                        'id':q['id'],
                        'grade':q['grade']
                    })
        quiz_attempts.append(attempt_data)
    context = {'exclude_fields': ['questions']}
    quiz_serializer = QuizSerializer(quiz, context=context).data
    data = {
        "quiz": quiz_serializer,
        "quiz_attempts": quiz_attempts
    }
    return HttpResponse(status=200, data=data)

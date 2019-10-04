from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions, serializers
from polls.models import Quiz, Question, Course
from polls.serializers import QuizSerializer
from polls.permissions import IsInstructorInCourse, InCourse, QuizInCourse
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
    qids = {}
    for question in questions:
        if question.get('id', None) and question.get('mark', None):
            qids[str(question['id'])] = question
        else:
            HttpResponse(status=400)
    # validate questions belong to course
    instructor_not_course_questions = Question.objects.filter(author=request.user, pk__in=qids.keys())
    questions_in_course = Question.objects.filter(author=request.user, pk__in=qids.keys())

    questions = questions_in_course.union(instructor_not_course_questions)

    if len(questions) != len(qids):
        raise serializers.ValidationError({"error": "there is some questions does not belong to course and yourself"})
    copy_questions = []
    for question in questions:
        old_id = question.id
        if question.course and question.course.id == course_id:
            qids[str(old_id)]['id'] = old_id
        else:
            new_question = copy_a_question(question)
            copy_questions.append(new_question)
            qids[str(old_id)]['id'] = new_question.id
    data['questions'] = qids.values()
    Course.objects.get(pk=course_id).questions.add(*copy_questions) # auto add question into course


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

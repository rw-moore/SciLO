from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication
from django.shortcuts import get_object_or_404
from polls.models import Attempt, Quiz, Response, QuizQuestion, Question
from polls.serializers import AnswerSerializer
from polls.permissions import OwnAttempt, InQuiz


def update_grade(quiz_id, attempt_data):
    '''
    grade is percentage, sum(mark*grade)/sum(mark)
    '''
    quiz_mark = 0
    quiz_base_mark = 0
    for question in attempt_data['questions']:
        response_total_mark = 0
        response_total_base_mark = 0
        for response in question['responses']:
            response_object = get_object_or_404(Response, pk=response['id'])
            response_percentage = calculate_tries_grade(
                response['tries'],
                response_object.grade_policy.free_tries,
                response_object.grade_policy.penalty_per_try
            )[response_object.grade_policy.policy]/100
            response_mark = response_object.mark
            response_total_base_mark += response_mark
            response_total_mark += response_percentage * response_mark
        question_mark = get_object_or_404(QuizQuestion, quiz=quiz_id, question=question['id']).mark
        if response_total_base_mark:
            question_percentage = response_total_mark/response_total_base_mark
        else:
            question_percentage = response_total_base_mark
        question['grade'] = question_percentage*100
        quiz_mark += question_mark*question_percentage
        quiz_base_mark += question_mark
        if quiz_base_mark:
            attempt_data['grade'] = quiz_mark/quiz_base_mark
        else:
            attempt_data['grade'] = quiz_base_mark


def calculate_tries_grade(tries, free_tries, penalty_per_try):
    total = None
    highest = None
    lowest = None
    average = None
    lastest = None
    count = 0
    penalty_tries = 1
    free_tries = int(free_tries)
    penalty_per_try = float(penalty_per_try)

    if tries[0][1] is None:
        return {'average': 0, 'max': 0, 'recent': 0, 'min': 0}
    else:
        highest = tries[0][1]
        lowest = tries[0][1]
        total = 0

    for onetry in tries:
        if onetry[1] is None:
            break
        else:
            if free_tries:
                grade = onetry[1]
                free_tries -= 1
            else:
                grade = onetry[1]*((1-penalty_per_try)**penalty_tries)
                penalty_tries += 1
            total += grade
            lastest = grade
            count += 1
            if highest < grade:
                highest = grade
            if lowest > grade:
                lowest = grade
    average = total/count
    return {'average': average, 'max': highest, 'recent': lastest, 'min': lowest}


def find_object_from_list_by_id(target_id, data):
    for index, one in enumerate(data):
        if one['id'] == target_id:
            return index
    return -1


def left_tries(tries, ignore_grade=True):
    answered_count = 0
    if ignore_grade:
        pos = 0
    else:
        pos = 1
    for one_try in tries:
        if one_try[pos] is not None:
            answered_count += 1
        else:
            return len(tries)-answered_count
    return 0


def serilizer_quiz_attempt(attempt, context=None):
    if isinstance(attempt, Attempt):
        attempt_data = {"id": attempt.id}
        attempt_data['quiz'] = attempt.quiz_info
        attempt_data['quiz']['grade'] = attempt.quiz_attempts['grade']
        for question in attempt_data['quiz']['questions']:
            for addon_question in attempt.quiz_attempts['questions']:
                if question['id'] == addon_question['id']:
                    question['grade'] = addon_question['grade']
                    question['variables'] = addon_question['variables']
                    # re run script variable
                    attempt_vars = Question.objects.get(pk=question['id']).variables
                    for attempt_var in attempt_vars:
                        if attempt_var.name == 'script':
                            question['variables'].update(attempt_var.generate())
                    for response in question['responses']:
                        for addon_response in addon_question['responses']:
                            if response['id'] == addon_response['id']:
                                response['tries'] = addon_response['tries']
                                response['left_tries'] = left_tries(response['tries'], ignore_grade=False)
        return attempt_data
    else:
        raise Exception('attempt is not Attempt')


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt])
def get_quiz_attempt_by_id(request, pk):
    '''
    permission: has this quiz attempt
    '''
    attempt = get_object_or_404(Attempt, pk=pk)
    data = serilizer_quiz_attempt(attempt)
    return HttpResponse(data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InQuiz])
def create_quiz_attempt_by_quiz_id(request, quiz_id):
    student = request.user
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    attempt = Attempt.objects.create(student=student, quiz=quiz)
    data = serilizer_quiz_attempt(attempt)
    return HttpResponse(status=200, data=data)


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InQuiz])
def get_quizzes_attempt_by_quiz_id(request, quiz_id):
    student = request.user
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    if request.user.is_staff:
        attempts = Attempt.objects.filter(quiz=quiz)
    else:
        attempts = Attempt.objects.filter(student=student, quiz=quiz)
    data = {"quiz_attempts": [serilizer_quiz_attempt(attempt) for attempt in attempts]}
    return HttpResponse(status=200, data=data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt])
def submit_quiz_attempt_by_id(request, pk):

    attempt = get_object_or_404(Attempt, pk=pk)
    for question in request.data['questions']:
        qid = question['id']
        for response in question['responses']:
            rid = response['id']
            if response['answer'] == '' or response['answer'] is None:
                break
            i = find_object_from_list_by_id(qid, attempt.quiz_attempts['questions'])
            if i == -1:
                return HttpResponse(status=400, data={"message": "attempt-{} has no question-{}".format(pk, qid)})
            j = find_object_from_list_by_id(rid, attempt.quiz_attempts['questions'][i]['responses'])
            if j == -1:
                return HttpResponse(status=400, data={"message": "question-{} has no response-{}".format(qid, rid)})
            response_data = attempt.quiz_attempts['questions'][i]['responses'][j]
            remain_times = left_tries(response_data['tries'], ignore_grade=False)
            if remain_times:
                response_data['tries'][-1*remain_times][0] = response['answer']
                if request.data['submit']:
                    response_object = get_object_or_404(Response, pk=response['id'])
                    answers = AnswerSerializer(response_object.answers.all().order_by('id'), many=True).data
                    grade = response_object.algorithm.execute(response['answer'], answers)
                    response_data['tries'][-1*remain_times][1] = grade
                    response_data['tries'][-1*remain_times][2] = (int(grade) >= int(response_object.mark))

            else:
                return HttpResponse(status=400, data={"message": "no more tries are allowed"})
    if request.data['submit']:
        update_grade(attempt.quiz_id, attempt.quiz_attempts)
    attempt.save()
    data = serilizer_quiz_attempt(attempt)
    return HttpResponse(status=200, data=data)

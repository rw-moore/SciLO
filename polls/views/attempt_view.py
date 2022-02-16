import copy
import hashlib
import re
import datetime
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication
from django.shortcuts import get_object_or_404
from django.utils import timezone
# from django.contrib.auth.models import Permission
from polls.models import Attempt, Quiz, Response, QuizQuestion, Question, UserRole, variable_base_parser
from polls.models.algorithm import DecisionTreeAlgorithm #, MultipleChoiceComparisonAlgorithm
from polls.serializers import AnswerSerializer, get_question_mark, QuizSerializer
from polls.permissions import OwnAttempt, InQuiz, InstructorInQuiz

def update_grade(quiz_id, attempt_data):
    '''
    grade is percentage, sum(mark*grade)/sum(mark)
    '''
    quiz_mark = 0
    quiz_base_mark = 0
    for question in attempt_data['questions']:
        # response_total_mark = 0
        # response_total_base_mark = 0
        # for response in question['responses']:
        #     response_object = get_object_or_404(Response, pk=response['id'])
        #     response_percentage = calculate_tries_grade(
        #         response['tries'],
        #         response_object.grade_policy.free_tries,
        #         response_object.grade_policy.penalty_per_try
        #     )[response_object.grade_policy.policy]/response_object.mark
        #     response_mark = response_object.mark
        #     response_total_base_mark += response_mark
        #     response_total_mark += response_percentage * response_mark
        # question_mark = get_object_or_404(QuizQuestion, quiz=quiz_id, question=question['id']).mark
        question_object = get_object_or_404(QuizQuestion, quiz=quiz_id, question=question['id'])
        quiz_object = get_object_or_404(Quiz, id=quiz_id)
        question_percentage = calculate_tries_grade(
            question['tries'],
            question_object.question.grade_policy['free_tries'],
            question_object.question.grade_policy['penalty_per_try'],
            quiz_object.options['no_try_deduction']
        )["max"]/question_object.mark
        # if response_total_base_mark:
        #     question_percentage = response_total_mark/response_total_base_mark
        # else:
        #     question_percentage = response_total_base_mark
        question['grade'] = question_percentage*100
        quiz_mark += question_object.mark*question_percentage
        quiz_base_mark += question_object.mark
    if quiz_base_mark:
        attempt_data['grade'] = quiz_mark/quiz_base_mark
    else:
        attempt_data['grade'] = quiz_base_mark

def calculate_tries_grade(tries, free_tries, penalty_per_try, no_try_deduction):
    total = None
    highest = None
    lowest = None
    average = None
    lastest = None
    count = 0
    free_tries = int(free_tries)
    penalty_per_try = float(penalty_per_try/100)

    if len(tries) == 0 or tries[0][1] is None:
        return {'average': 0, 'max': 0, 'recent': 0, 'min': 0}
    else:
        highest = tries[0][1]
        lowest = tries[0][1]
        total = 0

    for num, onetry in enumerate(tries):
        if onetry[1] is None:
            break
        else:
            if num < free_tries or no_try_deduction:
                grade = onetry[1]
            else:
                grade = onetry[1]*max(0.0, 1 - penalty_per_try * (num - free_tries + 1))
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

def left_tries(tries, max_tries=1, ignore_grade=True):
    if max_tries == 0:
        return 1
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

def replace_var_to_math(val):
    return '<m value="{}" />'.format(val)

def hash_text(text, seed):
    salt = str(seed)
    return hashlib.sha256(salt.encode() + text.encode()).hexdigest()

def substitute_question_text(question, variables, seed, in_quiz=False):
    pattern = r'<v\s*?>(.*?)</\s*?v\s*?>'
    content = question['text']
    soln = question.get("solution", "")
    var_dict = variable_base_parser(variables)
    # re run script variable
    if variables and variables.name == 'script':
        pre_vars = copy.deepcopy(question['variables'])
        # get after value
        var_content = content + soln # if mutiple choice, add
        for response in question['responses']:
            if response['type']['name'] == 'multiple':
                var_content += str([x['text'] for x in response['answers']])
            var_content += str(response['text'])
        results = set(re.findall(pattern, var_content))
        question['variables'] = variables.generate(pre_vars, results, seed=seed)
    for response in question['responses']:
        if response['text']:  # can be empty
            response['text'] = re.sub(
                pattern,
                lambda x: replace_var_to_math(question['variables'][x.group(1)]), response['text'])
        if response['type']['name'] == 'multiple':
            for pos, choice in enumerate(response['answers']):
                display = re.sub(
                    pattern,
                    lambda x: replace_var_to_math(question['variables'][x.group(1)]), choice['text'])
                if in_quiz:
                    response['answers'][pos] = {"text":display, "id":hash_text(choice["text"], seed)}
                else:
                    response['answers'][pos]["text"] = display
                    response['answers'][pos]['id'] = hash_text(choice['text'], seed)
        elif response['type']['name'] == "sagecell":
            if response["type"]["inheritScript"]:
                response["type"]["code"] = var_dict["value"] + "\n" + response["type"]["code"]
    # replace variable into its value
    replaced_content = re.sub(
        pattern,
        lambda x: replace_var_to_math(question['variables'][x.group(1)]), content
    )
    replaced_soln = re.sub(
        pattern,
        lambda x: replace_var_to_math(question['variables'][x.group(1)]), soln
    )
    question['text'] = replaced_content
    question["solution"] = replaced_soln
    return question

def serilizer_quiz_attempt(attempt, context=None):
    print("attempt serializer")
    if isinstance(attempt, Attempt):
        attempt_data = {"id": attempt.id, "user": attempt.student.username}
        context = {
            'question_context': {
                'exclude_fields': ['owner', 'quizzes', 'course'],
                'response_context': {
                    'shuffle': attempt.quiz.options.get('shuffle', False)
                }
            }
        }
        serializer = QuizSerializer(attempt.quiz, context=context)
        attempt_data['quiz'] = serializer.data
        attempt_data['quiz']['grade'] = attempt.quiz_attempts['grade']
        for question in attempt_data['quiz']['questions']:
            for addon_question in attempt.quiz_attempts['questions']:
                if question['id'] == addon_question['id']:
                    # add question information
                    question['grade'] = addon_question['grade']
                    question['variables'] = addon_question['variables']
                    question['feedback'] = addon_question['feedback'] if 'feedback' in addon_question else []
                    question['tries'] = addon_question['tries']
                    question['left_tries'] = left_tries(question['tries'], question['grade_policy']['max_tries'], ignore_grade=False)
                    script_vars = Question.objects.get(pk=question['id']).variables
                    question = substitute_question_text(question, script_vars, attempt.id, True)
        return attempt_data
    else:
        raise Exception('attempt is not Attempt')


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt|InstructorInQuiz])
def get_quiz_attempt_by_id(request, pk):
    '''
    permission: has this quiz attempt or is instructor for this quiz
    '''
    attempt = get_object_or_404(Attempt, pk=pk)
    data = serilizer_quiz_attempt(attempt)
    # if the user has made more attempts after this they can't edit this anymore
    data['closed'] = Attempt.objects.filter(student=attempt.student, quiz=attempt.quiz, pk__gt=pk).exists()
    return HttpResponse(data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InQuiz])
def create_quiz_attempt_by_quiz_id(request, quiz_id):
    '''
    permission: has a group in this quiz's course
    TODO: check if this perm should be restricted more
    '''
    student = request.user
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    now = timezone.now()
    end = quiz.end_date
    start = quiz.begin_date
    if now > end:
        return HttpResponse(status=400, data={"message": "This quiz has ended."})
    if now < start:
        return HttpResponse(status=400, data={"message": "This quiz has not started."})
    previous_attempts = Attempt.objects.filter(quiz=quiz, student=student).order_by('-id')
    if quiz.options['max_attempts'] != 0 and quiz.options['max_attempts'] <= previous_attempts.count():
        return HttpResponse(status=400, data={'message': "You have no remaining attempts."})
    if previous_attempts.count() > 0 and (now - datetime.timedelta(seconds=2)).timestamp() < previous_attempts.first().create_date.timestamp():
        attempt = previous_attempts.first()
    else:
        attempt = Attempt.objects.create(student=student, quiz=quiz)
    data = serilizer_quiz_attempt(attempt)
    return HttpResponse(status=200, data=data)


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([InQuiz])
def get_quizzes_attempt_by_quiz_id(request, quiz_id):
    '''
    permission: admin sees all attempts
    instructor sees their courses attempts
    student sees their own attempts
    '''
    student = request.user
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    if request.user.is_staff:
        attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
    elif quiz.options.get('is_hidden'):
        if UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='change_quiz').exists():
            return HttpResponse(status=404)
        attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
    else:
        if UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='view_others_attempts').exists():
            attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
        else:
            attempts = Attempt.objects.filter(student=student, quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
    data = {
        "end": quiz.end_date,
        "quiz_attempts": [{'id': attempt['id'], 'user': attempt['student__username'], 'grade': attempt['quiz_attempts__grade'] or 0} for attempt in attempts]
    }
    return HttpResponse(status=200, data=data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt])
def submit_quiz_attempt_by_id(request, pk):
    attempt = get_object_or_404(Attempt, pk=pk)
    start = attempt.quiz.begin_date
    end = attempt.quiz.end_date
    now = timezone.now()
    if now > end:
        return HttpResponse(status=400, data={"message": "This quiz has ended."})
    if now < start:
        return HttpResponse(status=400, data={"message": "This quiz has not started."})
    if Attempt.objects.filter(student=attempt.student, quiz=attempt.quiz, pk__gt=pk).exists():
        return HttpResponse(status=400, data={"message": "You have already started a new attempt."})

    for question in request.data['questions']:
        qid = question['id']
        print("submit", qid)
        inputs = {}
        mults = {}
        i = find_object_from_list_by_id(qid, attempt.quiz_attempts['questions'])
        if i == -1:
            return HttpResponse(status=400, data={"message": "attempt-{} has no question-{}".format(pk, qid)})
        question_object = get_object_or_404(Question, pk=qid)
        # print('found question', qid)
        question_mark = get_question_mark(question_object.responses.all(), question_object.tree)
        for response in question['responses']:
            rid = response['id']
            if response['answer'] == '' or response['answer'] is None:
                break
            j = find_object_from_list_by_id(rid, attempt.quiz_attempts['questions'][i]['responses'])
            if j == -1:
                return HttpResponse(status=400, data={"message": "question-{} has no response-{}".format(qid, rid)})
            response_object = get_object_or_404(Response, pk=rid)
            # print('found response', rid)
            inputs[response_object.identifier] = response['answer']
            if response_object.rtype['name'] == 'multiple':
                print("found mult")
                answers = AnswerSerializer(response_object.answers.all().order_by('id'), many=True).data
                mults[response_object.identifier] = answers
        if (len(inputs) == 0):
            continue
        question_script = variable_base_parser(question_object.variables) if question_object.variables else {}
        args = {
            "full": False,
            "script": question_script,
            "seed": attempt.id
        }
        print("before algo", inputs)
        grade, feedback = DecisionTreeAlgorithm().execute(question_object.tree, inputs, args, mults)
        print(grade)
        i = find_object_from_list_by_id(question['id'], attempt.quiz_attempts['questions'])
        question_data = attempt.quiz_attempts['questions'][i]
        question_data['feedback'] = feedback
        remain_times = left_tries(question_data['tries'], question_object.grade_policy['max_tries'], ignore_grade=False)
        if remain_times and request.data['submit']:
            if question_object.grade_policy['max_tries'] == 0:
                question_data['tries'][-1] = [inputs, grade, int(grade) >= int(question_mark)]
                question_data['tries'].append([None, None, False])
            else:
                question_data['tries'][-1*remain_times] = [inputs, grade, int(grade) >= int(question_mark)]
        elif not remain_times:
            if inputs != question_data['tries'][-1][0]:
                return HttpResponse(status=400, data={"message": "No more tries are allowed"})
        # for response in question['responses']:
        #     response_object = get_object_or_404(Response, pk=response['id'])
        #     j = find_object_from_list_by_id(response['id'], attempt.quiz_attempts['questions'][i]['responses'])
        #     response_data = attempt.quiz_attempts['questions'][i]['responses'][j]
        #     remain_times = left_tries(response_data['tries'], ignore_grade=False)
        #     if remain_times and request.data['submit']:
        #         response_data['tries'][-1*remain_times][0] = response['answer']
        #         response_data['tries'][-1*remain_times][1] = grade
        #         response_data['tries'][-1*remain_times][2] = (int(grade) >= int(question_mark))
        #     elif not remain_times:
        #         if response['answer'] != response_data['tries'][-1][0]:
        #             return HttpResponse(status=400, data={"message": "No more tries are allowed"})
    if request.data['submit']:
        update_grade(attempt.quiz_id, attempt.quiz_attempts)
    attempt.save()
    data = serilizer_quiz_attempt(attempt)
    return HttpResponse(status=200, data=data)

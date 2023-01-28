import ast
import copy
import hashlib
import re
from datetime import datetime, timezone, timedelta
import requests
import uuid
import oauthlib.oauth1.rfc5849.signature as oauth
from urllib.parse import quote_plus
from django.http import HttpResponseServerError
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
        print('tries', question['tries'])
        question_percentage = calculate_tries_grade(
            question['tries'],
            question_object.question.grade_policy['free_tries'],
            question_object.question.grade_policy['penalty_per_try'],
            quiz_object.options['no_try_deduction']
        )
        print('percentage', question_percentage)
        print(question_object.mark)
        question_percentage = question_percentage["max"] / question_object.mark
        # if response_total_base_mark:
        #     question_percentage = response_total_mark/response_total_base_mark
        # else:
        #     question_percentage = response_total_base_mark
        question['grade'] = question_percentage*100
        quiz_mark += question_object.mark*question_percentage
        quiz_base_mark += question_object.mark
    if quiz_base_mark:
        print('quizmark / quizbasemark', quiz_mark, quiz_base_mark)
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

def left_tries(tries, max_tries=1, check_grade=True):
    if max_tries == 0:
        return 1
    answered_count = 0
    if check_grade:
        pos = 1
    else:
        pos = 0
    for one_try in tries:
        if one_try[pos] is not None:
            answered_count += 1
        else:
            return len(tries)-answered_count
    return 0

def replace_var_to_math(val, vartype=None):
    if vartype == 'm':
        val = val.replace('\\begin{matrix}', '\\begin{Matrix*}')
        val = val.replace('\\end{matrix}', '\\end{Matrix*}')
        val = re.sub(r'\\left[\(\[\{\|\\]{1,2}\\begin{array}{[clr]+}\\cdot', r'\\begin{Matrix*}', val)
        val = re.sub(r'\\end{array}\\right[\)\]\}\|\\]{1,2}', r'\\end{Matrix*}', val)
        val = val.replace(r'\\', '\\\\\\')
    elif vartype == 'v':
        val = val.replace("\\begin{matrix}", "\\begin{Vector*}")
        val = val.replace("\\end{matrix}", "\\end{Vector*}")
    return '<m value="{}" />'.format(val)

def hash_text(text, seed):
    salt = str(seed)
    return hashlib.sha256(salt.encode() + text.encode()).hexdigest()

if_pattern = re.compile(r'(<if>.*?</if>)', re.DOTALL)
cond_pattern = re.compile(r'<condition test="(.*?)">(.*?)</condition>', re.DOTALL)
var_pattern = re.compile(r'<v>(.*?)</v>')
var_m_pattern = re.compile(r'<v type="matrix">(.*?)</v>')
var_v_pattern = re.compile(r'<v type="vector">(.*?)</v>')

def pattern_replace(text, vars):
    text = re.sub(
        var_pattern,
        lambda x: replace_var_to_math(vars[x.group(1)]), 
        text
    )
    text = re.sub(
        var_m_pattern,
        lambda x: replace_var_to_math(vars[x.group(1)], 'm'), 
        text
    )
    text = re.sub(
        var_v_pattern,
        lambda x: replace_var_to_math(vars[x.group(1)], 'v'), 
        text
    )
    return text

def replace_if_cond(results, match):
    for cond_test in cond_pattern.findall(match.group(1)):
        test, res = cond_test
        if results[test] == True:
            return res
    return ""

def conditional_rendering(question, variables, seed):
    if variables and variables.name == 'script':
        pre_vars = copy.deepcopy(question['variables'])
        content = question.get('text', "")
        soln = question.get('solution', "")
        to_replace = set()
        for val in [content, soln]:
            for if_block in if_pattern.findall(val):
                for cond_test in cond_pattern.findall(if_block):
                    test, res = cond_test
                    to_replace.add(test)
        results = variables.generate(pre_vars, to_replace, seed=seed, opts={"latex":False})
        for i, res in results.items():
            if isinstance(res, bool):
                results[i] = res
            elif res == "true":
                results[i] = True
            elif res in ["false", "unknown"]:
                results[i] = False
            else:
                results[i] = "Error"
        new_content = if_pattern.sub(lambda x: replace_if_cond(results, x), content)
        new_soln = if_pattern.sub(lambda x: replace_if_cond(results, x), soln)
        question["text"] = new_content
        question["solution"] = new_soln
    return question

def substitute_question_text(question, variables, seed, in_quiz=False):
    question = conditional_rendering(question, variables, seed)
    content = question.get('text', "")
    soln = question.get("solution", "")
    feedback = question.get("feedback", {})
    var_dict = variable_base_parser(variables)
    # collect variables to substitute
    if variables and variables.name == 'script':
        pre_vars = copy.deepcopy(question['variables'])
        feedback_str = ""
        for v in feedback.values():
            feedback_str += str(v)
        # get after value
        var_content = content + soln + feedback_str
        # if mutiple choice, add
        for response in question['responses']:
            if response['type']['name'] == 'multiple':
                var_content += str([x['text'] for x in response['answers']])
            var_content += str(response['text'])
        # send values to sagecell for evaluation
        results = set(re.findall(var_pattern, var_content))
        results = results.union(set(re.findall(var_m_pattern, var_content)))
        results = results.union(set(re.findall(var_v_pattern, var_content)))
        question['variables'] = variables.generate(pre_vars, results, seed=seed)
    # replace values in text
    for response in question['responses']:
        if response['text']:  # can be empty
            response['text'] = pattern_replace(response['text'], question['variables'])
        if response['type']['name'] == 'multiple':
            for pos, choice in enumerate(response['answers']):
                display = pattern_replace(choice['text'], question['variables'])
                if in_quiz:
                    response['answers'][pos] = {"text":display, "id":hash_text(choice["text"], seed)}
                else:
                    response['answers'][pos]["text"] = display
                    response['answers'][pos]['id'] = hash_text(choice['text'], seed)
        elif response['type']['name'] == "sagecell":
            if response["type"]["inheritScript"]:
                response["type"]["code"] = var_dict["value"] + "\n" + response["type"]["code"]
    # replace variable into its value
    replaced_content = pattern_replace(content, question['variables'])
    replaced_soln = pattern_replace(soln, question['variables'])
    for k,v in feedback.items():
        for i,e in enumerate(v):
            feedback[k][i] = pattern_replace(e, question['variables'])
    question['text'] = replaced_content
    question["solution"] = replaced_soln
    question["feedback"] = feedback
    return question

def serilizer_quiz_attempt(attempt, status, exclude=['owner', 'quizzes', 'course']):
    if isinstance(attempt, Attempt):
        attempt_data = {
            "id": attempt.id, 
            "user": attempt.student.username,
            "last_saved_date": attempt.last_save_date
        }
        context = {
            'question_context': {
                'exclude_fields': exclude,
                'response_context': {
                    'shuffle': attempt.quiz.options.get('shuffle', False)
                }
            }
        }
        serializer = QuizSerializer(attempt.quiz, context=context)
        attempt_data['quiz'] = serializer.data
        review_options = attempt.quiz.review_options.get(status, {})
        attempt_data["status"] = review_options
        if review_options.get('marks', False):
            attempt_data['quiz']['grade'] = attempt.quiz_attempts['grade']
        else:
            attempt_data['quiz']['grade'] = None
        for question in attempt_data['quiz']['questions']:
            for addon_question in attempt.quiz_attempts['questions']:
                if question['id'] == addon_question['id']:
                    # add question information
                    if review_options.get('marks', False):
                        question['grade'] = addon_question.get('grade', 0)
                    else:
                        question['grade'] = None
                    if review_options.get('feedback', False):
                        question['feedback'] = addon_question.get('feedback', {})
                    else:
                        question['feedback'] = {}
                    if review_options.get('solution', False):
                        question['solution'] = addon_question.get('solution', '')
                    else:
                        question['solution'] = ''
                    
                    question['tries'] = addon_question['tries']
                    question['variables'] = addon_question['variables']
                    question['left_tries'] = left_tries(question['tries'], question['grade_policy']['max_tries'], check_grade=True)
                    script_vars = Question.objects.get(pk=question['id']).variables
                    question = substitute_question_text(question, script_vars, attempt.id, True)
        return attempt_data
    else:
        raise Exception('attempt is not Attempt')

def is_finished(attempt):
    if Attempt.objects.filter(student=attempt.student, quiz=attempt.quiz, pk__gt=attempt.pk).exists():
        return True
    for question in attempt.quiz_attempts['questions']:
        q_obj = get_object_or_404(Question, pk=question["id"])
        if q_obj.grade_policy["max_tries"] == 0:
            atry = question['tries'][-1]
            if not atry[2]:
                return False
        else:
            remain_times = left_tries(question['tries'], q_obj.grade_policy['max_tries'], check_grade=True)
            if remain_times == q_obj.grade_policy['max_tries']:
                return False
            elif remain_times > 0:
                atry = question['tries'][-1*remain_times-1]
                if not atry[2]:
                    return False
    return True

def get_status(attempt):
    status = None
    if attempt.quiz.end_date is not None and attempt.quiz.end_date < timezone.now():
        status = "closed"
    elif is_finished(attempt):
        status = "later"
    else:
        status = "during"
    return status

@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt|InstructorInQuiz])
def get_quiz_attempt_by_id(request, pk):
    '''
    permission: has this quiz attempt or is instructor for this quiz
    '''
    attempt = get_object_or_404(Attempt, pk=pk)
    status = get_status(attempt)
    view_attempt = attempt.quiz.review_options.get(status, {}).get('attempt', False)
    if view_attempt:
        data = serilizer_quiz_attempt(attempt, status=status)
        # if the user has made more attempts after this they can't edit this anymore
        data['closed'] = Attempt.objects.filter(student=attempt.student, quiz=attempt.quiz, pk__gt=pk).exists()
    else:
        data = {'status':403, 'message':"The instructor has not given permission to view the attempt at this time."}
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
    start = quiz.start_date
    print(request.data)
    is_redirect = request.data.get('redirect', False)
    if end is not None and now > end:
        return HttpResponse(status=400, data={"message": "This quiz has ended."})
    if now < start:
        return HttpResponse(status=400, data={"message": "This quiz has not started."})
    previous_attempts = Attempt.objects.filter(quiz=quiz, student=student).order_by('-id')
    if quiz.options['max_attempts'] != 0 and quiz.options['max_attempts'] <= previous_attempts.count():
        return HttpResponse(status=400, data={'message': "You have no remaining attempts."})
    if previous_attempts.count() > 0 and not is_finished(previous_attempts.first()) and is_redirect:
        attempt = previous_attempts.first()
    else:
        attempt = Attempt.objects.create(student=student, quiz=quiz)
    try:
        data = serilizer_quiz_attempt(attempt, status="during")
        return HttpResponse(status=200, data=data)
    except:
        attempt.delete()
    return HttpResponseServerError()


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
    data = {
        "end": quiz.end_date,
        "quiz_attempts": []
    }
    if request.user.is_staff:
        attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
        data["quiz_attempts"] = [{'id': attempt['id'], 'user': attempt['student__username'], 'grade': attempt['quiz_attempts__grade'] or 0} for attempt in attempts]
    elif quiz.options.get('is_hidden'):
        if UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='change_quiz').exists():
            return HttpResponse(status=404)
        attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
        data["quiz_attempts"] = [{'id': attempt['id'], 'user': attempt['student__username'], 'grade': attempt['quiz_attempts__grade'] or 0} for attempt in attempts]
    else:
        if UserRole.objects.filter(user=request.user, course=quiz.course, role__permissions__codename='view_others_attempts').exists():
            attempts = Attempt.objects.filter(quiz=quiz).values('id', 'student__username', 'quiz_attempts__grade')
            data["quiz_attempts"] = [{'id': attempt['id'], 'user': attempt['student__username'], 'grade': attempt['quiz_attempts__grade'] or 0} for attempt in attempts]
        else:
            attempts = Attempt.objects.filter(student=student, quiz=quiz)
            for attempt in attempts:
                status = get_status(attempt)
                val = {'id': attempt.id, 'user': attempt.student.username}
                if quiz.review_options.get(status, {}).get('marks', False):
                    val['grade'] = attempt.quiz_attempts['grade'] or 0
                else:
                    val['grade'] = None
                data['quiz_attempts'].append(val)
    return HttpResponse(status=200, data=data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([OwnAttempt])
def submit_quiz_attempt_by_id(request, pk):
    attempt = get_object_or_404(Attempt, pk=pk)
    start = attempt.quiz.start_date
    end = attempt.quiz.end_date
    now = timezone.now()
    if end is not None and now > end:
        return HttpResponse(status=403, data={"message": "This quiz has ended."})
    if now < start:
        return HttpResponse(status=403, data={"message": "This quiz has not started."})
    if Attempt.objects.filter(student=attempt.student, quiz=attempt.quiz, pk__gt=pk).exists():
        return HttpResponse(status=403, data={"message": "You have already started a new attempt."})

    for question in request.data['questions']:
        qid = question['id']
        inputs = {}
        i = find_object_from_list_by_id(qid, attempt.quiz_attempts['questions'])
        if i == -1:
            return HttpResponse(status=400, data={"message": "attempt-{} has no question-{}".format(pk, qid)})
        question_object = get_object_or_404(Question, pk=qid)
        # print('found question', qid)
        question_mark = get_question_mark(question_object.responses.all(), question_object.tree)
        for response in question['responses']:
            rid = response['id']
            if 'answer' not in response or response['answer'] == '' or response['answer'] is None:
                break
            j = find_object_from_list_by_id(rid, attempt.quiz_attempts['questions'][i]['responses'])
            if j == -1:
                return HttpResponse(status=400, data={"message": "question-{} has no response-{}".format(qid, rid)})
            response_object = get_object_or_404(Response, pk=rid)
            # print('found response', rid)
            inputs[response_object.identifier] = {
                "value": response['answer'],
                "type": response_object.rtype['name'],
                "mults": AnswerSerializer(response_object.answers.all().order_by('id'), many=True).data,
                "blockedOps": response_object.rtype.get('blockedOps', []),
                "hasUnits": response_object.rtype.get('hasUnits', False)
            }

        if len(inputs) == 0:
            continue
        values = {}
        for k,v in inputs.items():
            values[k] = v['value']
        if request.data['submit']:
            question_script = variable_base_parser(question_object.variables) if question_object.variables else {}
            args = {
                "full": False,
                "script": question_script,
                "seed": attempt.id
            }
            result, feedback = DecisionTreeAlgorithm().execute(question_object.tree, inputs, args)
            grade = result["score"]
            i = find_object_from_list_by_id(question['id'], attempt.quiz_attempts['questions'])
            question_data = attempt.quiz_attempts['questions'][i]
            question_data['feedback'] = feedback
            remain_times = left_tries(question_data['tries'], question_object.grade_policy['max_tries'], check_grade=True)
            if remain_times:
                if question_object.grade_policy['max_tries'] == 0:
                    question_data['tries'][-1] = [values, grade, int(grade) >= int(question_mark)]
                    if int(grade) < int(question_mark):
                        question_data['tries'].append([None, None, False])
                else:
                    question_data['tries'][-1*remain_times] = [values, grade, int(grade) >= int(question_mark)]
            else:
                if values != question_data['tries'][-1][0]:
                    return HttpResponse(status=403, data={"message": "No more tries are allowed"})
        else:
            i = find_object_from_list_by_id(question['id'], attempt.quiz_attempts['questions'])
            question_data = attempt.quiz_attempts['questions'][i]
            remain_times = left_tries(question_data['tries'], question_object.grade_policy['max_tries'])
            if remain_times:
                if question_object.grade_policy['max_tries'] == 0:
                    if question_data['tries'][-1][1] is None:
                        question_data['tries'][-1][0] = values
                    else:
                        question_data['tries'].append([values, None, False])
                else:
                    question_data['tries'][-1*remain_times][0] = values
    if request.data['submit']:
        update_grade(attempt.quiz_id, attempt.quiz_attempts)
        send_lti_grade(request, attempt.quiz_attempts['grade'])
        attempt.last_submit_date = timezone.now()
        attempt.last_save_date = timezone.now()
        attempt.save()
        if is_finished(attempt):
            status = "later"
        else:
            status = "during"
        if attempt.quiz.review_options.get(status, {}).get('attempt', False):
            data = serilizer_quiz_attempt(attempt, status=status)
            return HttpResponse(status=200, data=data)
        else:
            return HttpResponse(status=307, data={"message":"The instructor has disallowed viewing the quiz after finishing."})
    else:
        attempt.last_save_date = timezone.now()
        attempt.save()
        return HttpResponse(status=200, data={"last_saved_date": attempt.last_save_date})

def send_lti_grade(request, grade):
    return_url = request.session.get('lti_return_address', 'https://eclass.srv.ualberta.ca/mod/lti/service.php')
    sourcedId = request.session.get('lti_sourcedid', '{"data":{"instanceid":"110249","userid":"305434","typeid":null,"launchid":229434618},"hash":"7797d28c9c964a1ade39270d70afdcf64b6b7f01fdd1445480e23b5db9b21c4f"}')
    body = f"""<?xml version = "1.0" encoding = "UTF-8"?>
<imsx_POXEnvelopeRequest xmlns = "http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
	<imsx_POXHeader>
		<imsx_POXRequestHeaderInfo>
	        <imsx_version>V1.0</imsx_version>
            <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
    </imsx_POXHeader>
    <imsx_POXBody>
        <replaceResultRequest>
            <resultRecord>
                <sourcedGUID>
                    <sourcedId>{sourcedId}</sourcedId>
                </sourcedGUID>
                <result>
                    <resultScore>
                        <language>en</language>
                        <textString>{grade}</textString>
                    </resultScore>
                </result>
            </resultRecord>
        </replaceResultRequest>
    </imsx_POXBody>
</imsx_POXEnvelopeRequest>"""
    uri_query = ""
    client_secret = "bjcvdbjfnjbgwbf"
    present_date = datetime.now(timezone.utc)
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": (
            'OAuth realm="https://eclass.srv.ualberta.ca/mod/lti/service.php",'
            'oauth_callback="about:blank",'
            'oauth_consumer_key="bfnsjbdjsvbfjb",'
            'oauth_nonce="'+uuid.uuid4().hex+'",'
            'oauth_timestamp="'+str(int(datetime.timestamp(present_date)))+'",'
            'oauth_signature_method="HMAC-SHA1",'
            'oauth_version="1.0"'
        )
    }
    print(headers)
    print(body)
    params = oauth.collect_parameters(
        uri_query=uri_query,
        body=body,
        headers=headers,
        exclude_oauth_signature=True,
        with_realm=False
    )
    norm_params = oauth.normalize_parameters(params)
    base_uri = oauth.base_string_uri(return_url)
    base_str = oauth.signature_base_string(
        "POST",
        base_uri,
        norm_params
    )
    sig = oauth.sign_hmac_sha1(
        base_str,
        client_secret,
        '' # resource_owner_secret - not used
    )
    print(sig)
    print(base_str)
    headers["Authorization"] += f',oauth_signature="{quote_plus(sig)}"'
    print(headers)
    resp = requests.post(return_url, data=body, headers=headers)
    print(resp)
    print(resp.text)
    raise ValueError
    

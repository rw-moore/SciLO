from django.shortcuts import get_object_or_404
from polls.models import Response, ResponseAttempt
from polls.serializers import AnswerSerializer
from django.db import connection
from polls.script.query.grading import get_responses_grades_by_questionattempt_id

class GradingController(object):
    '''
    A Management that given a response-attempt object, using sage script and saving result into response-attempt
    and then return it
    '''
    def __init__(self, data):
        # {'answers_string': '2', 'response': '1', 'question_attempt': 1, 'id': '4'}
        self.data = data
        self.response = get_object_or_404(Response, pk=self.data.get('response'))
        self.response_attempt = get_object_or_404(ResponseAttempt, pk=data['id'])
        self.question = self.response.question
        self.question_attempt = self.response_attempt.question_attempt
        self.grade = 0

    def _find_its_algorithm(self):
        return self.response.algorithm

    def run(self):
        self._grade_response()
        self._update_response_grade()
        self._update_question_grade()
        return

    def _grade_response(self):
        # TODO grade policy
        # skip
        ###################
        self.grade = 0
        algorithm = self._find_its_algorithm()
        serializer = AnswerSerializer(self.response.answers, many=True)
        answers = serializer.data
        results = algorithm.run(self.data['answers_string'], answers)
        for result in results:
            self.grade += result['accuracy']*self.response.weight
        return self.grade
    
    def _update_response_grade(self):
        self.response_attempt.grade = self.grade
        self.response_attempt.save()
    
    def _update_question_grade(self):
        # rows is a list of (avg, max, min, id, weight)
        rows = get_responses_grades_by_questionattempt_id(self.question_attempt.id)
        # TODO grade policy
        # skip
        # for now, we just avg
        ###################
        response_total_weight = 0
        response_total_grade = 0
        for row in rows:
            response_total_weight += row[4]
            response_total_grade += row[0]
        self.question_attempt.grade = self.question.weight*(response_total_grade/response_total_weight)
        self.question_attempt.save()
        return self.question_attempt.grade



        


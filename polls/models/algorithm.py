from datetime import datetime
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models.fields import NOT_PROVIDED
from django.utils.deconstruct import deconstructible
from django import forms
import json
import subprocess


def algorithm_base_generate(atype, **kwargs):
    ALGORITHMS = {'numerical': NumericalComparisonAlgorithm,
                  'string': StringComparisonAlgorithm, }

    algorithm = ALGORITHMS[atype](**kwargs)
    return algorithm


def algorithm_base_parser(instance):
    (path, aytpe, data) = instance.deconstruct()
    data['__alg_type__'] = aytpe[0]
    return data


class Algorithm(object):
    '''
    Algorithm class 
    '''

    def run(self):
        raise NotImplementedError

    def execute(self):
        raise NotImplementedError

    def deconstruct(self):
        raise NotImplementedError


class NumericalComparisonAlgorithm(Algorithm):

    __alg_type__ = 'numerical'
    __params__ = ('precision_type', 'precision_value', )

    def __init__(self, **kwargs):
        self.__args__ = {
            'precision_type': None,
            'precision_value': None}
        for k, v in kwargs.items():
            if k in self.__params__:
                self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.algorithm.NumericalComparisonAlgorithm"
        args = [self.__alg_type__]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''

        student_answer_string = json.dumps(student_answer)
        answers_string = json.dumps(answers)
        args = json.dumps(self.__args__)
        result = subprocess.run(
            ["sage", "polls/script/numerical.py",
             student_answer_string, answers_string, args
             ],
            capture_output=True
        )
        return json.loads(result.stdout)


class MutipleChioceComparisonAlgorithm(Algorithm):
    __alg_type__ = 'mutiple_choice'
    __params__ = ('max_choice')

    def __init__(self, **kwargs):
        self.__args__ = {'max_choice': None}
        for k, v in kwargs.items():
            if k in self.__params__:
                self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.algorithm.MutipleChioceComparisonAlgorithm"
        args = [self.__alg_type__]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        # answers: each choice and its weight
        # student_answer['answers_string']: "['some','string',..]"
        # answer['content'] = "some_string"
        r = []
        student_answer_set = set(json.loads(student_answer['answers_string']))
        for answer in answers:
            answer_string = answer['content']
            if answer_string in student_answer_set:
                r.append(answer)
        return r


class MathExpressionComparisonAlgorithm(Algorithm):
    __alg_type__ = 'math_express'
    __params__ = ('exclude')

    def __init__(self, **kwargs):
        self.__args__ = {'exclude': None}
        for k, v in kwargs.items():
            if k in self.__params__:
                self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.algorithm.MathExpressionComparisonAlgorithm"
        args = [self.__alg_type__]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''

        student_answer_string = json.dumps(student_answer)
        answers_string = json.dumps(answers)
        args = json.dumps(self.__args__)
        result = subprocess.run(
            ["sage", "polls/script/mathexpress.py",
             student_answer_string, answers_string, args
             ],
            capture_output=True
        )
        return json.loads(result.stdout)


class StringComparisonAlgorithm(Algorithm):

    __alg_type__ = 'string'
    __params__ = ('ignore_case', )

    def __init__(self, **kwargs):
        self.__args__ = {'ignore_case': False}
        for k, v in kwargs.items():
            if k in self.__params__:
                self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.algorithm.StringComparisonAlgorithm"
        args = [self.__alg_type__]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''
        matched_answer = []
        ignore_case = self.__args__.get('ignore_case', False)
        student_answer_value = student_answer['answers_string']

        for answer in answers:
            if ignore_case:
                if answer['content'].lower() == student_answer_value.lower():
                    matched_answer.append(answer)
            else:
                if answer['content'] == student_answer_value:
                    matched_answer.append(answer)
        return matched_answer


class AlgorithmField(models.Field):
    '''
    AlgorithmField will generate algorithm (Algorithm)by given 
    algorithm's type and other args
    '''

    description = "Algorithm field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    ''' override django methods '''

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        data = json.loads(value)
        atype = data.pop('__alg_type__')
        return algorithm_base_generate(atype, **data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, Algorithm):
            instance = algorithm_base_parser(instance)
        return json.dumps(instance)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs

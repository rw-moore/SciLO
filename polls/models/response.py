from datetime import datetime
from django.db import models
from django.utils import timezone
from polls.models import Question, User
from .algorithm import AlgorithmField, StringComparisonAlgorithm
from django.core.exceptions import ValidationError
from django.db.models.signals import pre_save
from django import forms
import json


def response_base_generate(rtype, **kwargs):
    if rtype == 'string':
        return StringResponse(**kwargs)
    elif rtype == 'mutiple_choice':
        return None


def response_base_parser(instance):
    (path, rytpe, data) = instance.deconstruct()
    data['__response_type__'] = rytpe[0]
    return data


class ResponseBase():
    '''
    ResponseBase is corresponse to type attribute in Reponse model
    ResponseBase has following attributes:
    1. __response_type__, string name of response type
    2. __params__: different response type has different __params__
    3. __args__: the map which keys are items in __params__

    ResponseBase is able to be load from json or save to json by calling 
    save_to_json() or load_from_json()
    '''

    def run(self):
        raise NotImplementedError

    def deconstruct(self):
        raise NotImplementedError


class StringResponse(ResponseBase):
    __response_type__ = 'string'
    __params__ = ('max_length', )

    def __init__(self, **kwargs):
        self.__args__ = {'max_length': None}
        for k, v in kwargs.items():
            if k in self.__params__:
                self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.response.StringResponse"
        args = [self.__response_type__]
        kwargs = self.__args__
        return (path, args, kwargs)


class ResponseField(models.Field):
    '''
    ResponseField is a Field of responseBase.
    '''

    description = "response field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    ''' override django methods '''

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, pression, connection):
        if value is None:
            return value
        data = json.loads(value)
        rtype = data.pop('__response_type__')
        return response_base_generate(rtype, **data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, ResponseBase):
            instance = response_base_parser(instance)
        return json.dumps(instance)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs


class Response(models.Model):
    '''
    reponse represent a student reponse input box, it can be mutiple 
    choice reponse, numerical reponse, string reponse, math expression
    reponse and so on

    name: reponse's name 

    question: the question that this reponses belongs to

    algorithm: the comparison algorithm to use to calcuate students' 
    accuracy

    rtype: ResponseBase, the type of response

    answers: [Answer], answers for this response
    '''

    class Meta:
        app_label = 'polls'
        unique_together = (('question', 'name',),)

    name = models.CharField(max_length=20)
    content = models.TextField(null=True, blank=True)
    question = models.ForeignKey(
        'Question',
        related_name='responses',
        on_delete=models.CASCADE,
        null=True, blank=True)
    weight = models.PositiveSmallIntegerField(default=100)
    algorithm = AlgorithmField(default=StringComparisonAlgorithm())

    rtype = ResponseField(default=StringResponse())

    def __str__(self):
        return super().__str__()+' name: '+str(self.name)


class ResponseAttempt(models.Model):
    '''
    grade: Float, current grade

    response: Response, a response that correseponses to this attempt

    question_attempt: QuestionAttempt, the QuestionAttempt who contains
    this response attempt

    answers_string: json String, this string is to contains all
    information of student answer value

    author: User, who write this attempt

    '''
    class Meta:
        app_label = 'polls'

    grade = models.FloatField(default=0)

    response = models.ForeignKey(
        Response, on_delete=models.CASCADE,
        related_name="response_attempts")

    question_attempt = models.ForeignKey(
        'QuestionAttempt', on_delete=models.CASCADE,
        related_name="response_attempts",
        blank=True, null=True)

    answers_string = models.TextField()

    # variables = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        from .quiz import QuizQuestion
        if self.question_attempt:
            question = self.question_attempt.question
            response = self.response
            if response not in question.responses.all():
                raise ValidationError("{} does not have this {}".format(
                    question, response))

        super().save(*args, **kwargs)

    def __str__(self):
        return super().__str__()+': {}'.format(self.answers_string)

import json
from django.db import models
from django.core.exceptions import ValidationError
from .gradepolicy import GradePolicy, GradePolicyField
from .algorithm import AlgorithmField, StringComparisonAlgorithm


def response_base_generate(rtype):
    name = rtype.pop('name', None)
    return ResponseBase(name, **rtype)


def response_base_parser(instance):
    (_, rytpe, data) = instance.deconstruct()
    data['name'] = rytpe[0]
    return data


class ResponseBase:
    '''
    ResponseBase is corresponse to type attribute in Reponse model
    ResponseBase has following attributes:
    1. __response_type__, string name of response type
    2. __args__: the map which keys are items

    ResponseBase is able to be load from json or save to json by calling
    save_to_json() or load_from_json()
    '''
    __types__ = ['string', 'mutiple_choice']
    def __init__(self, name, **kwargs):
        self.name = 'string' #default
        if name.lower() in self.__types__:
            self.name = name.lower()
        self.__args__ = {}
        for k, v in kwargs.items():
            self.__args__[k] = v

    def deconstruct(self):
        path = "polls.models.response.ResponseBase"
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)


class ResponseField(models.Field):
    '''
    ResponseField is a Field of responseBase.
    '''

    description = "response field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, pression, connection):
        if value is None:
            return value
        data = json.loads(value)
        return response_base_generate(data)

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
        unique_together = (('question', 'index',),)

    index = models.IntegerField()
    text = models.TextField(null=True, blank=True)
    question = models.ForeignKey(
        'Question',
        related_name='responses',
        on_delete=models.CASCADE,
        null=True, blank=True)
    mark = models.PositiveSmallIntegerField(default=100)
    algorithm = AlgorithmField(default=StringComparisonAlgorithm())
    grade_policy = GradePolicyField(default=GradePolicy(3, 0, 'average', 'int'))
    rtype = ResponseField(default=ResponseBase('string'))

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
        if self.question_attempt:
            question = self.question_attempt.question
            response = self.response
            if response not in question.responses.all():
                raise ValidationError("{} does not have this {}".format(
                    question, response))

        super().save(*args, **kwargs)

    def __str__(self):
        return super().__str__()+': {}'.format(self.answers_string)

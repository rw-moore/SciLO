from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import JSONField
from .gradepolicy import GradePolicy, GradePolicyField
from .algorithm import AlgorithmField, StringComparisonAlgorithm

def default_string_dict():
    return {'name': 'string'}

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
    grade_policy = GradePolicyField(default=GradePolicy(3))
    rtype = JSONField(default=default_string_dict)

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

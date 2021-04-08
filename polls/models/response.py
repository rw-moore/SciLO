from django.db import models
# from django.core.exceptions import ValidationError
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
    identifier = models.TextField(null=True, blank=True)
    question = models.ForeignKey(
        'Question',
        related_name='responses',
        on_delete=models.CASCADE,
        null=True, blank=True)
    mark = models.PositiveSmallIntegerField(default=100)
    algorithm = AlgorithmField(default=StringComparisonAlgorithm())
    grade_policy = GradePolicyField(default=GradePolicy(3))
    rtype = JSONField(default=default_string_dict)
    patterntype = models.TextField(null=True, blank=True)
    pattern = models.TextField(null=True, blank=True)
    patternflag = models.TextField(null=True, blank=True)
    patternfeedback = models.TextField(null=True, blank=True)

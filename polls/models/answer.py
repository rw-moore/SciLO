
from django.db import models


class Answer(models.Model):
    '''
    Answer is represent a question's answer

    question: Question, the question of this answer

    content: string, answer's math expression or value..

    correct: Boolean, if the answer is correct

    accuracy: float(0<accuracy<1), the percentage of how good is the
    answer

    comment: string

    '''

    class Meta:
        app_label = 'polls'

    response = models.ForeignKey('Response', related_name='answers', on_delete=models.CASCADE,
                                 null=True, blank=True)

    text = models.TextField(max_length=500)

    grade = models.FloatField()

    comment = models.CharField(max_length=200, null=True, blank=True)

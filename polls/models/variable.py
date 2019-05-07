
from django.db import models


class Variable(models.Model):
    '''
    name: String, variable name
    question: Question, the question that has this variable
    value: String, the value of this variable
    '''
    class Meta:
        app_label = 'polls'

    name = models.CharField(max_length=20)
    question = models.ForeignKey(
        'Question',
        related_name='variables',
        on_delete=models.CASCADE
    )
    value = models.CharField(max_length=200)

    def generate(self):
        # generate random variable via type
        return

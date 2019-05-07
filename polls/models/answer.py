
from django.db import models
from django.core.exceptions import ValidationError
from .utils import MinMaxFloat


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

    content = models.TextField(max_length=500)

    correction = models.BooleanField()

    accuracy = MinMaxFloat(0, 1)

    comment = models.CharField(max_length=200, null=True, blank=True)

    @classmethod
    def create_from_json(cls, json_dict):
        from copy import deepcopy
        answer_dict = deepcopy(json_dict)
        if answer_dict:
            instance = cls.objects.create(**answer_dict)
            return instance
        else:
            return None

    def save(self, *args, **kwargs):
        if float(self.accuracy) != 1.0 and self.correction:
            raise ValidationError('the answer is correct, but accuracy is not 1')
        if float(self.accuracy) == 1.0 and not self.correction:
            raise ValidationError('the answer is not correct, but accuracy is 1')

        super(Answer, self).save(*args, **kwargs)

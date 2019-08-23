
from django.db import models
from django.contrib.postgres.fields import JSONField
from .user import User
from .quiz import Quiz


class Attempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    quiz_attempts = JSONField(default=dict)

    class Meta:
        app_label = 'polls'

    def save(self, *args, **kwargs):
        # auto initialize position, if position is not given
        quiz_dict = {'mark': -1, 'grade': -1, 'questions': []}
        quiz = Quiz.objects.get(id=self.quiz.id)
        for question in quiz.questions.all():
            question_dict = {'id': question.id, 'grade': -1, 'responses': []}
            for response in question.responses.all():
                max_tries = int(response.grade_policy.grade_policy_base_parser()['max_tries'])
                question_dict['responses'].append(
                    {'id': response.id,
                     'tries': tuple([(None, -1) for i in range(max_tries)])}
                )
            quiz_dict['questions'].append(question_dict)
        self.quiz_attempts = quiz_dict
        return super().save(*args, **kwargs)

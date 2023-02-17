
# import json
from django.db import models
from django.utils import timezone
from .user import UserProfile

class Attempt(models.Model):
    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    quiz_attempts = models.JSONField(default=dict)
    create_date = models.DateTimeField()
    last_submit_date = models.DateTimeField(null=True, blank=True)
    last_save_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'polls'
        permissions = [
            ('view_others_attempts', 'View other user\'s attempts.')
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            # auto initialize position, if position is not given
            quiz_dict = {'grade': None, 'questions': []}

            for question in self.quiz.questions.all():
                question_dict = {'id': question.id, 'grade': None, 'variables': {}, 'responses': []}
                max_tries = 1 if self.quiz.options['single_try'] else max(int(question.grade_policy['max_tries']), 1)

                question_dict['tries'] = [[None, None, False] for i in range(max_tries)]
                for response in question.responses.all():
                    # max_tries = int(response.grade_policy.grade_policy_base_parser()['max_tries'])
                    question_dict['responses'].append(
                        {
                            'id': response.id,
                            # 'tries': [[None, None, False] for i in range(max_tries)]
                        }
                    )
                if question.variables and question.variables.name != 'script':
                    question_dict['variables'].update(question.variables.generate())
                quiz_dict['questions'].append(question_dict)
            self.quiz_attempts = quiz_dict
            self.create_date = timezone.now()
        return super().save(*args, **kwargs)


# import json
from django.db import models
from django.contrib.postgres.fields import JSONField
from .user import UserProfile

class Attempt(models.Model):
    student = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    quiz_attempts = JSONField(default=dict)
    quiz_info = JSONField(default=dict)

    class Meta:
        app_label = 'polls'
        permissions = [
            ('view_others_attempts', 'View other user\'s attempts.')
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            from polls.serializers import QuizSerializer
            # auto initialize position, if position is not given
            quiz_dict = {'grade': None, 'questions': []}

            context = {
                'question_context': {
                    'exclude_fields': ['owner', 'quizzes', 'course'],
                    'response_context': {
                        'exclude_fields': ['answers'],
                        'shuffle': self.quiz.options.get('shuffle', False)
                    }
                }
            }

            serializer = QuizSerializer(self.quiz, context=context)
            self.quiz_info = serializer.data

            for question in self.quiz.questions.all():
                question_dict = {'id': question.id, 'grade': None, 'variables': {}, 'responses': []}
                max_tries = 1 if self.quiz_info['options']['single_try'] else max(int(question.grade_policy['max_tries']), 1)

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
        return super().save(*args, **kwargs)

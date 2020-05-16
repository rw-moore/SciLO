
# import json
from django.db import models
from django.contrib.postgres.fields import JSONField
from .user import User

class Attempt(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    quiz_attempts = JSONField(default=dict)
    quiz_info = JSONField(default=dict)

    class Meta:
        app_label = 'polls'

    def save(self, *args, **kwargs):
        if not self.pk:
            from polls.serializers import QuizSerializer
            # auto initialize position, if position is not given
            quiz_dict = {'grade': None, 'questions': []}

            context = {
                'question_context': {
                    'exclude_fields': ['author', 'quizzes', 'course'],
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
                for response in question.responses.all():
                    max_tries = int(response.grade_policy.grade_policy_base_parser()['max_tries'])
                    question_dict['responses'].append(
                        {'id': response.id,
                         'tries': [[None, None, False] for i in range(max_tries)]}
                    )
                for variable in question.variables:
                    # to be completed script
                    if variable.name != 'script':
                        question_dict['variables'].update(variable.generate())
                quiz_dict['questions'].append(question_dict)
            self.quiz_attempts = quiz_dict
        return super().save(*args, **kwargs)

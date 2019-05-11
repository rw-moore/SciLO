from polls.models import *
from django.db import models
from django.test import TestCase

# python manage.py test -v=2 polls.models.tests_variable


class VariableTestCase(TestCase):

    def setUp(self):

        self.questions = []
        self.variables = []
        q1 = Question(title='math problem1', background='1+1', weight=100)
        q2 = Question(title='math problem2', background='1+1', weight=100)
        q3 = Question(title='math problem3', background='1+1', weight=100)
        self.questions = [q1, q2, q3]
        [q.save() for q in self.questions]

        v1 = Variable(name='v1', value='1', question=q1)
        v2 = Variable(name='v2', value='2', question=q1)
        v3 = Variable(name='v3', value='3', question=q2)
        self.variables = [v1, v2, v3]
        [v.save() for v in self.variables]

    def test_foreignkey(self):
        #
        self.assertEquals(Variable.objects.get(name='v1').question.title, 'math problem1')
        self.assertEquals(Variable.objects.get(name='v2').question.title, 'math problem1')
        self.assertEquals(Variable.objects.get(name='v3').question.title, 'math problem2')

        self.assertEquals(
            len(Question.objects.get(title='math problem1').variables.all()),2)

        self.assertEquals(
            list(Question.objects.get(title='math problem2').variables.all()),
            [Variable.objects.get(name='v3')])

        # delete v3
        Variable.objects.get(name='v3').delete()

        self.assertEquals(
            list(Question.objects.get(title='math problem2').variables.all()),
            [])

        # delete q1
        Question.objects.get(title='math problem1').delete()
        self.assertEquals(list(Variable.objects.all()), [])

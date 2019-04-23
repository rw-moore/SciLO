from polls.models import *
from django.db import models
from django.test import TestCase
from polls.models.algorithm import (
    StringComparisonAlgorithm,
    NumericalComparisonAlgorithm)

# python manage.py test -v=2 polls.models.tests_response


class ResponseTestCase(TestCase):

    def setUp(self):
        self.r = []
        self.q = Question(title='math problem1', background='1+1', weight=100)
        self.s = StringComparisonAlgorithm()
        self.n = NumericalComparisonAlgorithm()
        self.q.save()

    def test_init(self):
        self.assertEqual(len(Question.objects.all()), 1)
        self.get_q()
        self.assertEqual(self.q.pk, 1)
        r1 = Response(name='r1', question=self.q, algorithm=self.s)
        r2 = Response(name='r2', question=self.q, algorithm=self.s)
        r3 = Response(name='r3', question=self.q, algorithm=self.s)
        self.r = [r1, r2, r3]
        [r.save() for r in self.r]
        self.get_r()
        self.assertEqual(len(self.r), 3)
        self.assertEqual(self.r[0].name, 'r1')
        self.assertEqual(self.r[1].name, 'r2')
        self.assertEqual(self.r[2].name, 'r3')

        self.assertEqual(self.r[0].question.pk, 1)
        self.assertEqual(self.r[1].question.pk, 1)
        self.assertEqual(self.r[2].question.pk, 1)

        self.assertEqual(len(self.q.responses.all()), 3)

    def get_r(self):
        self.r = Response.objects.all()

    def get_q(self):
        self.q = Question.objects.all()[0]

    def test_reponse_algorithm(self):
        r1 = Response(name='r1', question=self.q, algorithm=self.s)
        r1.save()
        r1 = Response.objects.get()

        self.assertEqual(r1.algorithm.__args__, StringComparisonAlgorithm().__args__)
        # change algorithm
        r1.algorithm = self.n
        r1.save()
        r1 = Response.objects.get()
        self.assertEqual(r1.algorithm.__args__, NumericalComparisonAlgorithm().__args__)

    def test_delete(self):
        self.test_init()

        # del r3
        self.r[2].delete()
        self.get_q()
        self.get_r()

        self.assertEqual(len(self.r), 2)
        self.assertEqual(self.q.pk, 1)
        self.assertEqual(self.q.title, 'math problem1')

        self.assertEqual(self.r[0].pk, 1)
        self.assertEqual(self.r[1].pk, 2)

        self.assertEqual(self.r[0].name, 'r1')
        self.assertEqual(self.r[1].name, 'r2')
        self.assertEqual([r.pk for r in list(self.q.responses.all())], [1, 2])

        # del q
        self.q.delete()
        self.assertEqual(list(Question.objects.all()), [])
        self.assertEqual(list(Response.objects.all()), [])

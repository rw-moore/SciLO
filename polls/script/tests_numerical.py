from django.db import models
from django.test import TestCase
from polls.models import *
from django.core.exceptions import ValidationError
# python manage.py test -v=2 polls.script.tests_numerical
import subprocess
class NumericalTestCase(TestCase):

    def setUp(self):
        d = {'__alg_type__': 'numerical', 
            'precision_type': 'digits',
            'precision_value': '5'
            }

        self.response = Response.objects.create(
            name='r1', content='sin(10)',
            algorithm=AlgorithmManagement.create_from_json(d)
        )
        self.answer1 = Answer.objects.create(
            content='2*sin(5)*cos(5)',accuracy=1,
            correction=True, response=self.response
        )
        self.answer2 = Answer.objects.create(
            content='0',accuracy=0,
            correction=False, response=self.response
        )
        self.answer3 = Answer.objects.create(
            content='sin(10)',accuracy=0.2,
            correction=False, response=self.response
        )
        self.answer4 = Answer.objects.create(
            content='-0.54402',accuracy=1,
            correction=True, response=self.response
        )
    


    def test_1(self):
        attemp = ResponseAttempt(
            response=self.response,
            answers_string='0'
        )
        d =  [ a.to_json() for a in self.response.answers.all() ]
        a = attemp.to_json()

        result = self.response.algorithm.run(a,d)
        self.assertEquals(len(result),1)
        self.assertEquals(int(result[0]['id']), int(self.answer2.id))

    def test_2(self):
        attemp = ResponseAttempt(
            response=self.response,
            answers_string='1'
        )
        d =  [ a.to_json() for a in self.response.answers.all() ]
        a = attemp.to_json()

        result = self.response.algorithm.run(a,d)
        self.assertEquals(len(result),0)


    def test_3(self):
        attemp = ResponseAttempt(
            response=self.response,
            answers_string='-0.5440200000012345'
        )
        d =  [ a.to_json() for a in self.response.answers.all() ]
        a = attemp.to_json()

        result = self.response.algorithm.run(a,d)
        self.assertEquals(len(result),3)



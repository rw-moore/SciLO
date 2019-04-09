from ..models import *
from django.db import models
from django.test import TestCase


# python manage.py test -v=2 polls.tests.tests_question1

class Question1TestCase(TestCase):
    '''
The sun is often described by physicists as a very good example of a “black body”. 
(a) Given its yellow colour why do we call it a “black body”?

Answer:
    A black body in physics is one which absorbs all incident radiation, 
regardless of wavelength, and emits radiation based solely on its temperature. 
Thus the “black” refers to the absorption since a black object is one 
which absorbs all wavelengths of visible light and, at room temperature, 
emits invivsible infrared radiation. The only difference between such an object 
and the sun is that the sun is hot enough that it emits in the visible spectrum and so appears yellow.


(b) When stars several times more massive come to the end of their lives they start to collapse and heat up. 
How would this change their colour assuming they started as a Red Giant? Explain.

Answer:
    As they heat up the wavelength of the peak of their emission spectrum will decrease, 
moving towards the blue end of the spectrum. The increase in the short wavelengths 
will make them start to appear yellow and eventually white. If they heat up even further 
the peak will move into the ultra-violet at the stars will appear bluish-white.


(c) These massive stars finally die in a massive explosion we call a supernova. 
This occurs when the star has, through a process of nuclear fusion, converted 
all of its core to iron at which point no more fusion is possible. 
Why does the fusion process stop there?

Answer:
    Nuclear fusion combines two smaller nuclei into a single larger one. 
For this process to be energetically allowed it must release energy. 
This means that the larger nucleus must be more tightly bound than the smaller one.
However once we get to iron we find that larger nuclei are less tightly bound 
and thus it requires an energy input to fuse them. Consequently the fusion process 
abruptly stops causing the star to collapse in a massive explosion that we call a supernova.
    '''

    def setUp(self):
        text = 'The sun is often described by physicists as a very good example of a “black body”.'
        self.d = {}
        self.d['category'] = {
            'title': '2015-12-final',
            'questions': [{
                'title': 'q2',
                'weight': '100',
                'background': text,
                'responses': []
            }]
        }

        content1 = '(a) Given its yellow colour why do we call it a “black body”?'
        answer1 = '''
A black body in physics is one which absorbs all incident radiation, 
regardless of wavelength, and emits radiation based solely on its temperature. 
Thus the “black” refers to the absorption since a black object is one 
which absorbs all wavelengths of visible light and, at room temperature, 
emits invivsible infrared radiation. The only difference between such an object 
and the sun is that the sun is hot enough that it emits in the visible spectrum and so appears yellow.
        '''
        content2 = '(b) When stars several times more massive' +\
            ' come to the end of their lives they start to collapse and heat up.' +\
            ' How would this change their colour assuming they started as a Red Giant? Explain.'

        answer2 = '''
As they heat up the wavelength of the peak of their emission spectrum will decrease, 
moving towards the blue end of the spectrum. The increase in the short wavelengths 
will make them start to appear yellow and eventually white. If they heat up even further 
the peak will move into the ultra-violet at the stars will appear bluish-white.'''

        self.d['category']['questions'][0]['responses'] = [
            {
                'content': content1,
                'name': 'r1',
                'type': {
                    '__response_type__': 'string',
                    'max_length': '200'
                },
                'algorithm': {
                    '__alg_type__': 'string',
                    'ignore_case': True
                },
                'answers': [{
                    'content': answer1,
                    'correction': 'True',
                    'accuracy': '1'
                }]
            }, {
                'content': content2,
                'name': 'r2',
                'answers': [{
                    'content': answer2,
                    'correction': 'True',
                    'accuracy': '1'
                }]
            }
        ]

    def test_convert_json_to_model(self):

        from copy import deepcopy

        a = QuestionCategory.create_from_json(self.d['category'])

        answers_json = [ a.to_json() for a in Answer.objects.all()] 

        d = {'answers_string': "I don't know", 'response':Response.objects.all()[0]}

        student_answer = ResponseAttempt.objects.create(**d)

        self.assertEquals(student_answer.response.algorithm.run(
            student_answer.to_json(),answers_json
        ), [])
        


from polls.models import *
from polls.serializers import AnswerSerializer
from django.db import models
from django.test import TestCase
from django.core.exceptions import ValidationError
# python manage.py test -v=2 polls.tests.tests_answer


class AnswerTestCase(TestCase):

    def setUp(self):
        self.answers1 = []
        self.answers2 = []
        self.question = Question(title='math problem1', background='a+b', weight=50)
        self.question.save()
        self.response1 = Response(name='1', content='1+1', question=self.question)
        self.response2 = Response(name='2', content='1+2', question=self.question)
        self.response1.save()
        self.response2.save()

    def test_validation(self):
        a1 = Answer(response=self.response1, content='2', correction=True, accuracy=0.1)
        self.assertRaises(ValidationError, a1.save)
        a2 = Answer(response=self.response1, content='3', correction=False, accuracy=1)
        self.assertRaises(ValidationError, a2.save)

    def test_add(self):
        # add three answer to reponse1
        a1 = Answer(response=self.response1, content='2', correction=True, accuracy=1)
        a2 = Answer(response=self.response1, content='3', correction=False, accuracy=0)
        a3 = Answer(response=self.response1, content='11', correction=False, accuracy=0.5)

        self.answers1 = [a1, a2, a3]
        [a.save() for a in self.answers1]

        self.assertEqual(len(Answer.objects.all()), 3)
        self.assertEqual([a.content for a in Answer.objects.all()], ['2', '3', '11'])
        self.question = Question.objects.get(title='math problem1')
        self.assertEqual(self.question.pk, 1)
        self.assertEqual(len(self.question.responses.all()), 2)
        t = self.question.responses.all().get(content='1+1')
        self.assertEqual(len(t.answers.all()), 3)
        answers = list(t.answers.all())
        answers.sort(key=lambda a: a.accuracy, reverse=True)
        self.assertEqual([a.accuracy for a in answers], [1, 0.5, 0])
        self.assertEqual([a.pk for a in answers], [1, 3, 2])

    def test_del(self):
        # add three answer to response1
        a11 = Answer(response=self.response1, content='2', correction=True, accuracy=1)
        a12 = Answer(response=self.response1, content='3', correction=False, accuracy=0)
        a13 = Answer(response=self.response1, content='11', correction=False, accuracy=0.5)

        self.answers1 = [a11, a12, a13]
        [a.save() for a in self.answers1]

        # add 2 answer to reponse2
        a21 = Answer(response=self.response2, content='0', correction=False, accuracy=0)
        a22 = Answer(response=self.response2, content='3', correction=True, accuracy=1)

        self.answers2 = [a21, a22]
        [a.save() for a in self.answers2]

        self.assertEqual(len(Answer.objects.all()), 5)

        # get question responses answers from database
        self.question = Question.objects.get(title='math problem1')
        self.reponse1 = self.question.responses.all().get(content='1+1')
        self.response2 = self.question.responses.all().get(content='1+2')
        self.answers1 = list(self.response1.answers.all())
        self.answers2 = list(self.response2.answers.all())

        self.assertEqual(len(self.response1.answers.all()), 3)
        self.assertEqual(len(self.response2.answers.all()), 2)

        # del a21
        self.assertEqual(self.answers2[0].content, '0')
        self.answers2[0].delete()
        # re fetch reponse2 answers2
        self.response2 = self.question.responses.all().get(content='1+2')
        self.answers2 = list(self.response2.answers.all())
        self.assertEqual(len(self.answers2), 1)
        self.assertEqual(self.answers2[0].content, '3')

        # del response1
        self.response1.delete()
        self.assertEqual(len(self.question.responses.all()), 1)
        self.assertEqual(self.question.responses.get().content, '1+2')
        self.assertEqual(len(Response.objects.all()), 1)

        # del question
        self.question.delete()
        self.assertEqual(len(Question.objects.all()), 0)
        self.assertEqual(len(Response.objects.all()), 0)
        self.assertEqual(len(Answer.objects.all()), 0)
    
    def test_serializer(self):
        a11 = Answer(response=self.response1, content='2', correction=True, accuracy=1)
        serializer = AnswerSerializer(a11)
        print(serializer.data)

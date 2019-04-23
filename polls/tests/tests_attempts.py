from polls.models import *
from django.db import models
from django.test import TestCase
from django.core.exceptions import ValidationError

# python manage.py test -v=2 polls.models.tests_attempts


class AttemptsTestCase(TestCase):

    def setUp(self):
        # quiz1->none
        #
        # quiz2->question1->response1
        #
        # quiz3->question2->response2
        #    |       |
        #    |       ------>response3
        #    |
        #    --->question3->none

        self.quizzes = []
        self.questions = []
        self.responses = []

        q1 = Question(title='math problem1', background='1+1', weight=100)
        q2 = Question(title='math problem2', background='1+1', weight=100)
        q3 = Question(title='math problem2', background='1+1', weight=100)
        self.questions = [q1, q2, q3]
        [q.save() for q in self.questions]

        q1 = Quiz(title='math problem quiz1', description='1+1')
        q2 = Quiz(title='math problem quiz2', description='1+1')
        q3 = Quiz(title='math problem quiz3', description='1+1')
        self.quizzes = [q1, q2, q3]
        [q.save() for q in self.quizzes]

        r1 = Response(name='r1', question=self.questions[0])
        r2 = Response(name='r2', question=self.questions[1])
        r3 = Response(name='r3', question=self.questions[1])
        self.responses = [r1, r2, r3]
        [r.save() for r in self.responses]

        QuizQuestion.objects.create(quiz=self.quizzes[1], question=self.questions[0])
        QuizQuestion.objects.create(quiz=self.quizzes[2], question=self.questions[1])
        QuizQuestion.objects.create(quiz=self.quizzes[2], question=self.questions[2])

    def test_question_attempt(self):
        # create
        QuestionAttempt.objects.create(question=self.questions[0])

        qa = QuestionAttempt.objects.get()
        self.assertEqual(qa.question.title, 'math problem1')

        # test delete
        self.questions[0].delete()
        self.assertEqual(len(QuestionAttempt.objects.all()), 0)

    def test_quiz_attempt(self):
        QuizAttempt.objects.create(quiz=self.quizzes[0])
        qa = QuizAttempt.objects.get()

        # test delete
        self.quizzes[0].delete()
        self.assertEqual(len(QuizAttempt.objects.all()), 0)

    def test_quiz_question_attempt_failed(self):
        question_a = QuestionAttempt.objects.create(question=self.questions[-1])
        response_a = ResponseAttempt.objects.create(
            response=self.responses[0])

        response_a.question_attempt = question_a
        self.assertRaises(ValidationError, response_a.save)

    def test_quiz_question_attempt_successful(self):
        question_a = QuestionAttempt.objects.create(question=self.questions[0])
        response_a = ResponseAttempt.objects.create(
            response=self.responses[0])

        response_a.question_attempt = question_a
        response_a.save()

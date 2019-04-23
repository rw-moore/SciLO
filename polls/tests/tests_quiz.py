
from polls.models import *
from django.db import models
from django.test import TestCase
from django.db.models.query import QuerySet
from polls.serializers import QuizSerializer
# python manage.py test -v=2 polls.tests.tests_quiz


class QuizTestCase(TestCase):

    def setUp(self):
        self.quizzes = []
        self.questions = []
        self.us = []
        self.category = None

    def init_questions(self):
        q1 = Question(title='math problem1', background='1+1', weight=100)
        q2 = Question(title='math problem2', background='1+1', weight=100)
        q3 = Question(title='math problem2', background='1+1', weight=100)
        self.questions = [q1, q2, q3]
        [q.save() for q in self.questions]

    def init_quizzes(self):
        q1 = Quiz(title='math problem quiz1', description='1+1')
        q2 = Quiz(title='math problem quiz2', description='1+1')
        q3 = Quiz(title='math problem quiz3', description='1+1')
        self.quizzes = [q1, q2, q3]
        [q.save() for q in self.quizzes]

    def init_us(self):
        u1 = User(username='test1@ualberta.ca', password='123456')
        u2 = User(username='test2@ualberta.ca', password='123456')
        self.us = [u1, u2]
        [u.save() for u in self.us]

    def test_init(self):
        self.init_us()
        self.init_questions()
        self.init_quizzes()

    def test_save(self):
        [u.save() for u in self.us]
        [q.save() for q in self.quizzes]
        [q.save() for q in self.questions]

    def test_quiz_question(self):
        # test adding new relationships
        # quiz0.questions = []
        # quiz1.questions = [question0]
        # quiz2.questions = [question1,question2]

        self.test_init()
        QuizQuestion.objects.create(quiz=self.quizzes[1],
                                    question=self.questions[0],
                                    position=0)
        QuizQuestion.objects.create(quiz=self.quizzes[2],
                                    question=self.questions[1])
        QuizQuestion.objects.create(quiz=self.quizzes[2],
                                    question=self.questions[2])
        self.test_save()

        # quiz0.questions = []
        self.assertEqual(list(self.quizzes[0].questions.all()), [])

        # quiz1.questions = [question0]
        self.assertEqual(list(self.quizzes[1].questions.all()),
                         [self.questions[0]])

        # [quiz1] = question0.quizzes
        self.assertEqual([self.quizzes[1]],
                         list(self.questions[0].quizzes.all()))

        # quiz2.questions = [question1,question2]
        self.assertEqual(list(self.quizzes[2].questions.all()).sort(
            key=lambda x: str(x)
        ),
            [self.questions[1], self.questions[2]].sort(
            key=lambda x: str(x)
        ))

        # [quiz2.questions] = question1.quizzes
        # question1.quizzes = question2.quizzes
        self.assertEqual([self.quizzes[2]],
                         list(self.questions[1].quizzes.all()))
        self.assertEqual(list(self.questions[1].quizzes.all()),
                         list(self.questions[2].quizzes.all()))

        # test delete relationships
        self.quizzes[1].delete()
        # get newest data from database
        self.quizzes = list(Quiz.objects.all())
        self.questions = list(Question.objects.all())

        self.assertEqual([1, 3], [q.pk for q in self.quizzes])
        self.assertEqual(list(self.questions[0].quizzes.all()), [])
        self.assertEqual(len(QuizQuestion.objects.all()), 2)

        self.questions[2].delete()

        self.quizzes = list(Quiz.objects.all())
        self.questions = list(Question.objects.all())

        self.assertEqual(len(QuizQuestion.objects.all()), 1)
        self.assertEqual([1, 3], [q.pk for q in self.quizzes])
        self.assertEqual([1, 2], [q.pk for q in self.questions])
        self.assertEqual([q.pk for q in self.quizzes[1].questions.all()], [2])

    def test_category_quiz(self):
        self.test_init()

        self.category = QuizCategory(title='c1')
        self.category.save()
        self.category = QuizCategory.objects.all()[0]
        self.assertEqual(len(QuizCategory.objects.all()), 1)
        self.assertEqual(QuizCategory.objects.all()[0].title, 'c1')
        self.assertEqual(QuizCategory.objects.all()[0].pk, 1)

        # quiz0,1,2 -> category
        self.category.quizzes.set(self.quizzes)
        self.category.save()
        self.category = QuizCategory.objects.all()[0]
        self.assertEqual(len(self.category.quizzes.all()), 3)
        self.assertEqual([q.pk for q in self.category.quizzes.all()], [1, 2, 3])
        self.assertEqual(self.quizzes[0].category, self.category)
        self.assertEqual(self.quizzes[1].category, self.category)
        self.assertEqual(self.quizzes[2].category, self.category)

        # quiz1,2 -> category; quiz0 -> None
        self.quizzes[0].category = None
        self.quizzes[0].save()
        self.category = QuizCategory.objects.all()[0]
        self.quizzes = list(Quiz.objects.all())
        self.assertEqual(self.quizzes[0].category, None)
        self.assertEqual([q.pk for q in self.category.quizzes.all()], [2, 3])

        # quiz0,1,2 -> category
        self.quizzes[0].category = self.category
        self.quizzes[0].save()
        self.category = QuizCategory.objects.all()[0]
        self.quizzes = list(Quiz.objects.all())
        self.assertEqual(self.quizzes[0].category.pk, 1)
        self.assertEqual([q.pk for q in self.category.quizzes.all()], [1, 2, 3])

        # delete quiz0
        self.quizzes[0].delete()
        self.quizzes = list(Quiz.objects.all())
        self.category = QuizCategory.objects.all()[0]
        self.assertEqual(len(self.quizzes), 2)
        self.assertEqual(len(self.category.quizzes.all()), 2)
        self.assertEqual([q.pk for q in self.category.quizzes.all()], [2, 3])
        self.assertEqual(self.quizzes[0].category, self.category)
        self.assertEqual(self.quizzes[1].category, self.category)

        # delete category
        self.category.delete()
        self.quizzes = list(Quiz.objects.all())
        self.assertEqual(len(Quiz.objects.all()), 0)
        self.assertEqual(len(QuizCategory.objects.all()), 0)

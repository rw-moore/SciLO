from polls.models import *

from django.db import models
from django.test import TestCase

# python manage.py test -v=2 polls.tests.tests_category

class CategoryTestCase(TestCase):


    def setUp(self):
        self.quiz_category = []
        self.question_category = []

    def category_save(self):
        [ c.save() for c in self.quiz_category]
        [ c.save() for c in self.question_category]

    def category_get(self):
        self.question_category = list(QuestionCategory.objects.all())
        self.quiz_category = list(QuizCategory.objects.all())

    def test_init(self):
        c11 = QuizCategory(title='c1')
        c12 = QuizCategory(title='c2')
        c13 = QuizCategory(title='c3')

        c21 = QuestionCategory(title='c1')
        c22 = QuestionCategory(title='c2')
        c23 = QuestionCategory(title='c3')
        
        [ i.save() for i in [c11,c12,c13]]
        [ i.save() for i in [c21,c22,c23]]

        self.category_get()

        self.assertEqual(len(self.question_category), 3)
        self.assertEqual(self.question_category[0].title, 'c1')
        self.assertEqual(self.question_category[1].title, 'c2')
        self.assertEqual(self.question_category[2].title, 'c3')
        
        self.assertEqual(len(self.quiz_category), 3)
        self.assertEqual(self.quiz_category[0].title, 'c1')
        self.assertEqual(self.quiz_category[1].title, 'c2')
        self.assertEqual(self.quiz_category[2].title, 'c3')

    def test_category_category(self):
        self.test_init()

        # c11->c12->c13
        self.quiz_category[0].children.set([self.quiz_category[1]])
        self.quiz_category[2].parent = self.quiz_category[1]
        
        self.category_save()
        self.category_get()

        self.assertEqual(list(self.quiz_category[2].children.all()), [])
        self.assertEqual(list(self.quiz_category[0].children.all()), [self.quiz_category[1]])
        self.assertEqual(list(self.quiz_category[1].children.all()), [self.quiz_category[2]])
        self.assertEqual(self.quiz_category[0].parent, None)
        self.assertEqual(self.quiz_category[1].parent, self.quiz_category[0])
        self.assertEqual(self.quiz_category[2].parent, self.quiz_category[1])

        # c21->c22
        #    ->c23
        self.question_category[0].children.set([self.question_category[1]])
        self.question_category[2].parent = self.question_category[0]
        
        self.category_save()
        self.category_get()

        self.assertEqual(list(self.question_category[0].children.all()), 
                        [self.question_category[1],self.question_category[2]])
        self.assertEqual(list(self.question_category[1].children.all()), [])
        self.assertEqual(list(self.question_category[2].children.all()), [])
        self.assertEqual(self.question_category[0].parent, None)
        self.assertEqual(self.question_category[1].parent, self.question_category[0])
        self.assertEqual(self.question_category[2].parent, self.question_category[0])

        # delete c12
        # c11
        self.quiz_category[1].delete()
        self.category_get()
        self.assertEqual(len(self.quiz_category),1)
        self.assertEqual(self.quiz_category[0].parent, None)
        self.assertEqual(list(self.quiz_category[0].children.all()), [])

        # remove c21'schildren relationship
        # c21 c22 c23
        self.quiz_category[0].delete()
        self.category_get()
        self.assertEqual(len(self.quiz_category),0)



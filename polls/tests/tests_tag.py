from django.test import TestCase
from polls.models import *
from polls.serializers import *
# python manage.py test -v=2 polls.tests.tag_test.TagModelTestCase


class TagModelTestCase(TestCase):
    def setUp(self):
        self.t1 = Tag.objects.create(name='math101')
        self.t2 = Tag.objects.create(name='100 level')
        self.t3 = Tag.objects.create(name='cmput366')
        self.q1 = Question.objects.create(title='math101 assignment1')

    def test_create_with_tags_model(self):
        # test if a question and quiz can with tags
        q1 = Question.objects.get(title='math101 assignment1')
        q1.tags.add(self.t1, self.t2)
        q1.save()

        math101_question = Question.objects.get(title='math101 assignment1')
        self.assertEqual(math101_question.tags.get(name='math101'), self.t1)

    def test_question_with_tags_serializer(self):
        math101_question = Question.objects.get(title='math101 assignment1')
        math101_question.tags.add(self.t1, self.t2)
        math101_question.save()
        serializer = QuestionSerializer(math101_question)
        tags_list = serializer.data['tags']
        tags_list.sort()
        tags = ['math101', '100 level']
        tags.sort()
        self.assertEqual(tags_list, tags)
    
    def test_create_with_tags_serializer(self):
        data = {
            'title' = 'cmput366 Monte Carlo tree'
        }
        QuestionSerializer

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
        tags_list.sort(key=lambda x: x['name'])
        tags = [{'name': 'math101'}, {'name': '100 level'}]
        tags.sort(key=lambda x: x['name'])
        self.assertEqual(tags_list, tags)

    def test_tag_deserializer(self):
        data1 = {'name': 'math101'}
        serialzier = TagSerializer(data=data1)
        self.assertTrue(serialzier.is_valid(), msg=str(serialzier.errors))
        serialzier.save()
        self.assertEqual(serialzier.data['name'], 'math101')

        data1 = {'name': 'new tag'}
        serialzier = TagSerializer(data=data1)
        self.assertTrue(serialzier.is_valid(), msg=str(serialzier.errors))
        serialzier.save()
        self.assertTrue(Tag.objects.filter(name='new tag').exists())
        self.assertTrue(len(Tag.objects.all()), 4)

    def test_tags_deserializer(self):
        data = [{'name': 'math101'}, {'name': 'math104'}, {'name': 'math105'}]
        serialzier = TagSerializer(data=data, many=True)
        self.assertTrue(serialzier.is_valid(), msg=str(serialzier.errors))
        serialzier.save()
        self.assertEqual(len(Tag.objects.filter(name__iregex=r'math\d+')), 3)

    def test_question_with_tags_deserializer(self):
        data1 = {
            'title': 'cmput366 Monte Carlo tree',
            'tags': [{'name': 'new tag'}, {'name': 'cmput366'}]
        }
        serialzier = QuestionSerializer(data=data1)
        self.assertTrue(serialzier.is_valid(), msg=str(serialzier.errors))
        serialzier.save()

        question = Question.objects.get(id=serialzier.data['id'])
        qtags = [t.name for t in question.tags.all()]
        qtags.sort()
        tags = ['new tag', 'cmput366']
        tags.sort()
        self.assertEqual(qtags, tags)

        data2 = {
            'id': question.id,
            'title': 'cmput366 Monte Carlo tree',
            'tags': [{'name': 'update tag'}, {'name': 'cmput366'}]
        }
        serialzier = QuestionSerializer(question, data=data2) # at view, if id is given, update() will be called
        self.assertTrue(serialzier.is_valid(), msg=str(serialzier.errors))
        serialzier.save()
        new_question = Question.objects.get(id=serialzier.data['id'])
        qtags = [t.name for t in new_question.tags.all()]
        qtags.sort()
        tags = ['update tag', 'cmput366']
        tags.sort()
        self.assertEqual(new_question.id, question.id)
        self.assertEqual(qtags, tags)

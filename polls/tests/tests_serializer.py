from polls.models import *
from polls.serializers import *
from django.db import models
from django.test import TestCase
import json
# python manage.py test -v=2 polls.tests.tests_serializer.SerializerTestCase


class SerializerTestCase(TestCase):
    def setUp(self):
        return

    def test_category(self):
        c1 = QuestionCategory.objects.create(title='a test')
        c0 = QuestionCategory.objects.create(title='root')
        c0.children.add(c1)
        c11 = QuestionCategory.objects.create(title='c11', parent=c1)
        c12 = QuestionCategory.objects.create(title='c12', parent=c1)
        json_data = QuestionCategorySerializer(c1)

        self.assertEquals(json_data.data['id'], 1)
        self.assertEquals(
            [i['id'] for i in json_data.data['children']],
            [3, 4])

        c1 = QuizCategory.objects.create(title='a test')
        c0 = QuizCategory.objects.create(title='root')
        c0.children.add(c1)
        c11 = QuizCategory.objects.create(title='c11', parent=c1)
        c12 = QuizCategory.objects.create(title='c12', parent=c1)
        json_data = QuizCategorySerializer(c1)
        self.assertEquals(json_data.data['id'], 1)
        self.assertEquals(
            [i['id'] for i in json_data.data['children']],
            [3, 4])

    def test_question(self):

        c1 = QuestionCategory.objects.create(title='a test')
        q1 = Question.objects.create(
            title='1+1',
            background='no background',
            category=c1
        )
        json_data = QuestionSerializer(q1)
        self.assertAlmostEquals(json_data.data['id'], 1)
        self.assertAlmostEquals(json_data.data['category'], 1)
        json_data = QuestionCategorySerializer(c1)
        self.assertAlmostEquals(json_data.data['id'], 1)
        self.assertAlmostEquals(json_data.data['questions'], [1])

    def test_quiz(self):

        c1 = QuizCategory.objects.create(title='a test')
        q1 = Quiz.objects.create(
            title='1+1',
            category=c1
        )
        json_data = QuizSerializer(q1)
        self.assertAlmostEquals(json_data.data['id'], 1)
        self.assertAlmostEquals(json_data.data['category'], 1)
        json_data = QuizCategorySerializer(c1)
        self.assertAlmostEquals(json_data.data['id'], 1)
        self.assertAlmostEquals(json_data.data['quizzes'], [1])

    def test_quiz_question(self):

        quiz_c1 = QuizCategory.objects.create(title='a test')
        quiz_1 = Quiz.objects.create(
            title='quiz_1',
            category=quiz_c1
        )

        question_c1 = QuestionCategory.objects.create(title='a test')
        question_1 = Question.objects.create(
            title='1+1',
            background='no background',
            category=question_c1
        )

        QuizQuestion.objects.create(
            quiz=quiz_1,
            question=question_1,
            position=0
        )

        import json
        serializer = QuizSerializer(quiz_1)
        str_data = json.dumps(serializer.data['questions'])
        data = json.loads(str_data)
        self.assertEquals(data[0]['id'], 1)
        serializer = QuestionSerializer(question_1)

        str_data = json.dumps(serializer.data['quizzes'])
        data = json.loads(str_data)
        self.assertEquals(data, [1])

    def test_response(self):

        r1 = Response.objects.create(name='r1')
        serilaizer = ResponseSerializer(r1)

        self.assertEquals(
            serilaizer.data['rtype']['__response_type__'],
            'string'
        )
        self.assertEquals(
            serilaizer.data['algorithm']['__alg_type__'],
            'string'
        )

    def test_user(self):
        # first add user
        u1 = User.objects.create_user(
            username='haotianzhu',
            password='123456'
        )
        u1.profile.institute = 'institute'
        serializer = UserSerializer(u1)
        self.assertEquals(serializer.data['institute'], 'institute')

    def test_response_and_answer(self):
        data = {
            'content': "sin(5)*cos(5)",
            'correction': '1',
            'accuracy': '1',
            'comment': 'there is no comment'
        }
        a = Answer.objects.create(**data)
        serializer = AnswerSerializer(a)
        self.assertEquals(serializer.data['correction'], True)

    def test_category_deserializer(self):
        c1 = QuizCategory.objects.create(title='c11')
        body = {
            'quizzes': [],
            'parent': 1,
            'title': 'a test',
            'author': None
        }
        serializer = QuizCategorySerializer(data=body)
        self.assertEquals(serializer.is_valid(), True)
        serializer.save()
        self.assertEquals(QuizCategory.objects.get(pk=2).parent.pk, c1.pk)
        return

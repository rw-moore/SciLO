from django.utils.dateparse import parse_datetime
from django.test import TestCase
from polls.models import *
from polls.serializers import *
# python manage.py test -v=2 polls.tests.tests_quiz.QuizModelTestCase


class QuizModelTestCase(TestCase):
    def setUp(self):
        self.q1 = Question.objects.create(title='math101 assignment1')
        self.q2 = Question.objects.create(title='math101 assignment2')
        self.q3 = Question.objects.create(title='math101 assignment3')

    def test_quiz_deserailzer(self):
        data = {
            "title": "123",
            "start_end_time": [
                "2019-07-04 12:27:11",
                "2019-07-06 12:27:11"
            ],
            "late_time": "2019-07-25 12:27:16",
            "attempt_limit": 3,
            "free_attempts": 1,
            "method": "highest",
            "attempt_deduction": 0,
            "late_deduction": 20,
            "notify_condition": [
                "Deadline",
                "Submission after deadline",
                "Flag of a question"
            ],
            "editable": [
                "Yiminghe",
                "jack"
            ],
            "questions": [
                {"id": str(self.q1.id), "mark": "100"},
            ]
        }
        serializer = QuizSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        quiz = serializer.save()
        self.assertEqual(quiz.title, '123')
        self.assertEqual(quiz.begin_date.year, parse_datetime('2019-07-04 12:27:11').year)
        self.assertEqual(quiz.begin_date.month, parse_datetime('2019-07-04 12:27:11').month)
        self.assertEqual(quiz.begin_date.day, parse_datetime('2019-07-04 12:27:11').day)
        self.assertEqual(quiz.end_date.year, parse_datetime('2019-07-06 12:27:11').year)
        self.assertEqual(quiz.end_date.month, parse_datetime('2019-07-06 12:27:11').month)
        self.assertEqual(quiz.end_date.day, parse_datetime('2019-07-06 12:27:11').day)
        self.assertEqual(len(quiz.questions.all()), 1)
        question = quiz.questions.all()[0]
        self.assertEqual(question.id, self.q1.id)
        self.assertEqual(question.title, 'math101 assignment1')

    def test_quiz_serailzer(self):
        data = {
            "title": "123",
            "start_end_time": [
                "2019-07-04 12:27:11",
                "2019-07-06 12:27:11"
            ],
            "late_time": "2019-07-25 12:27:16",
            "attempt_limit": 3,
            "free_attempts": 1,
            "method": "highest",
            "attempt_deduction": 0,
            "late_deduction": 20,
            "notify_condition": [
                "Deadline",
                "Submission after deadline",
                "Flag of a question"
            ],
            "editable": [
                "Yiminghe",
                "jack"
            ],
            "questions": [
                {"id": str(self.q1.id), "mark": "100"},
                {"id": str(self.q2.id), "mark": "10"},
                {"id": str(self.q3.id), "mark": "1"}
            ]
        }
        serializer = QuizSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        quiz = serializer.save()

        serializer = QuizSerializer(quiz)
        self.assertEqual(serializer.data['id'], quiz.id)
        self.assertEqual(serializer.data['title'], '123')
        self.assertEqual(len(serializer.data['start_end_time']), 2)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][0]).year,
            parse_datetime('2019-07-04 12:27:11').year)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][0]).month,
            parse_datetime('2019-07-04 12:27:11').month)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][0]).day,
            parse_datetime('2019-07-04 12:27:11').day)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][1]).year,
            parse_datetime('2019-07-06 12:27:11').year)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][1]).month,
            parse_datetime('2019-07-06 12:27:11').month)
        self.assertEqual(
            parse_datetime(serializer.data['start_end_time'][1]).day,
            parse_datetime('2019-07-06 12:27:11').day)
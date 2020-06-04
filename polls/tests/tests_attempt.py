from django.test import TestCase
from polls.models import *
from polls.serializers import *
# python manage.py test -v=2 polls.tests.tests_attempt.AttemptModelTestCase


class AttemptModelTestCase(TestCase):
    def setUp(self):
        self.q1 = Question.objects.create(title='math101 assignment1')
        self.q2 = Question.objects.create(title='math101 assignment2')
        self.q3 = Question.objects.create(title='math101 assignment3')
        self.r1 = Response.objects.create(question=self.q1, index=0)
        self.quiz = Quiz.objects.create(title='math101 assignment3')

        self.quiz.update_quiz_question_links([
            {"id":self.q1.id, "position":0},
            {"id":self.q2.id, "position":1},
            {"id":self.q3.id, "position":2}])
        self.user = UserProfile.objects.create_user('john', 'lennon@thebeatles.com', 'johnpassword')

    def test_create_quiz_attempt(self):
        attempt = Attempt.objects.create(student=self.user, quiz=self.quiz)

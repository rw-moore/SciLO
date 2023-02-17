from django.db import models
from .quiz import Quiz
from .user import UserProfile

class QuizLTI(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    userid = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    sourcedid = models.CharField(max_length=200)
    returnurl = models.CharField(max_length=200)

class LTISecrets(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    consumer_key = models.CharField(max_length=100)
    shared_secret = models.CharField(max_length=100)

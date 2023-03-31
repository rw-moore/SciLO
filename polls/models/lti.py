from django.db import models
from .quiz import Quiz
from .user import UserProfile

class QuizLTI(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    email = models.EmailField(max_length=255, default='')
    sourcedid = models.CharField(max_length=400)
    returnurl = models.CharField(max_length=200)
    # time stamp

class LTISecret(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    consumer_key = models.CharField(max_length=100)
    shared_secret = models.CharField(max_length=100)

class NonceTimeStamp(models.Model):
    nonce = models.CharField(max_length=50)
    timestamp = models.CharField(max_length=50)

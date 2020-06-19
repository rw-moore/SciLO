from django.db import models

class AuthMethod(models.Model):

    method = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.method

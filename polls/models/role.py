from django.db import models
from django.contrib.auth.models import Permission

class Role(models.Model):

    role_name = models.CharField(max_length=200, unique=True)
    permissions = models.ManyToManyField(Permission, blank=True)

    def __str__(self):
        return self.role_name

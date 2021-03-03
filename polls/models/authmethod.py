from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from .user import UserProfile
from .user_authmethod import UserAuthMethod

class AuthMethod(models.Model):

    method = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.method

@receiver(post_save, sender=AuthMethod)
def new_method(sender, **kwargs):
    # When an admin creates a new authmethod add it to all users
    instance = kwargs['instance']
    for user in UserProfile.objects.all():
        if not UserAuthMethod.objects.filter(user=user, method=instance).exists():
            UserAuthMethod.objects.create(user=user, method=instance)

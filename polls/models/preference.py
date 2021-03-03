from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from .user import UserProfile
from .user_preference import UserPreference

class Preference(models.Model):

    title = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.title

@receiver(post_save, sender=Preference)
def new_method(sender, **kwargs):
    # When an admin creates a new preference add it to all users
    instance = kwargs['instance']
    for user in UserProfile.objects.all():
        if not UserPreference.objects.filter(user=user, preference=instance).exists():
            UserPreference.objects.create(user=user, preference=instance)

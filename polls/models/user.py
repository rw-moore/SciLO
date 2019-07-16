from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    '''
    this class is to represent a user, a user should contains, password,
    email_address, and so on


    email_address: the unique email address

    password: string, max 20 length, min 6

    first_name: string

    last_name: string

    institute: string

    save(): override save method to validate the User information

    '''

    class Meta:
        app_label = 'polls'

    author = models.fauthor = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        null=True,
        blank=True
    )
    institute = models.CharField(max_length=50, null=True, blank=True)

    def save(self, *args, **kwargs):

        if len(self.author.password) < 6:
            raise ValidationError('password needs more than 6 characters')
        return super().save(*args, **kwargs)

    def __str__(self):
        return super().__str__()+' email: '+self.author.email


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            author=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

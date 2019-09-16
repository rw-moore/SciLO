from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .email_code import EmailCode


def validate_avatar_size(value):
    if value.size > 500000:
        raise ValidationError("The maximum file size that can be uploaded is 500KB")
    return value


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

    author = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        null=True,
        blank=True)
    institute = models.CharField(max_length=50, default='', null=True, blank=True)
    email_active = models.BooleanField(default=False)
    is_instructor = models.BooleanField(default=False)
    avatar = models.ImageField(
        upload_to='storage',
        verbose_name="avatar",
        max_length=254,
        validators=[validate_avatar_size],
        null=True)

    def __str__(self):
        return super().__str__()+' email: '+self.author.email


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(author=instance)
        Token.objects.create(user=instance)
        EmailCode.objects.create(author=instance, available=0)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
        instance.email_code.save()
    except User.email_code.RelatedObjectDoesNotExist:
        EmailCode.objects.create(author=instance)
    except User.profile.RelatedObjectDoesNotExist:
        UserProfile.objects.create(author=instance, available=0)

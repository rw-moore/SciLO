from django.db import models
from django.contrib.auth.models import User

class EmailCode(models.Model):
    '''
    name: the name of tag
    '''

    class Meta:
        app_label = 'polls'

    author = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True, related_name='email_code')
    token = models.CharField(max_length=6, null=False, blank=False)
    available = models.PositiveSmallIntegerField(default=3)

    @staticmethod
    def random_with_N_digits(n=6):
        from random import randint
        # https://stackoverflow.com/questions/2673385/how-to-generate-random-number-with-the-specific-length-in-python
        range_start = 10**(n-1)
        range_end = (10**n)-1
        return randint(range_start, range_end)

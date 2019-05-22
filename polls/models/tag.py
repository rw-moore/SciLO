from django.db import models


class Tag(models.Model):
    '''
    name: the name of tag
    '''

    class Meta:
        app_label = 'polls'

    name = models.CharField(unique=True, max_length=20, null=False, blank=False)

    def __str__(self):
        return self.name

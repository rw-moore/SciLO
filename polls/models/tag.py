from django.db import models


class Tag(models.Model):
    '''
    name: the name of tag
    '''

    class Meta:
        app_label = 'polls'

    name = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return '<Tag: {}>'.format(self.name)

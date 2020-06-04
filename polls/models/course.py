
from django.db import models

class Course(models.Model):
    '''
    each course has two default groups, shortname+_student_group and shortname+_instructor_group
    '''

    # groups = models.ManyToManyField(Group)
    fullname = models.CharField(max_length=200, null=False, blank=False, unique=True)
    shortname = models.CharField(max_length=50, null=False, blank=False, unique=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'polls'
        permissions = [
            ('move_users', 'Can add or delete a user in the course'),
            ('delete_questions_from_course', 'Delete questions in the course question bank'),
        ]

    def __str__(self):
        return self.fullname

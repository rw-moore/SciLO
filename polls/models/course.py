
from django.db import models

class Course(models.Model):
    '''
    each course has two default groups, shortname+_student_group and shortname+_instructor_group
    '''

    fullname = models.CharField(max_length=200, null=False, blank=False, unique=True)
    shortname = models.CharField(max_length=50, null=False, blank=False, unique=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'polls'
        permissions = [
            ('view_people', 'Can view the people in the course'),
            ('add_people', 'Can add a user to the course'),
            ('remove_people', 'Can remove people from the course'),
            ('delete_questions_from_course', 'Delete questions in the course question bank'),
        ]

    def __str__(self):
        return self.fullname

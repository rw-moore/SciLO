
import random
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from .role import Role

def random_code():
    random.seed()
    return str(random.randint(100000, 999999))

class Course(models.Model):
    '''
    each course has two default groups, shortname+_student_group and shortname+_instructor_group
    '''

    fullname = models.CharField(max_length=200, null=False, blank=False, unique=True)
    shortname = models.CharField(max_length=50, null=False, blank=False, unique=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    secret_code = models.CharField(default=random_code, unique=True, max_length=10)
    enroll_role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    class Meta:
        app_label = 'polls'
        permissions = [
            ('view_people', 'Can view the people in the course'),
            ('add_people', 'Can add a user to the course'),
            ('remove_people', 'Can remove people from the course'),
            ('delete_questions_from_course', 'Delete questions in the course question bank'),
            ('access_code', 'Can access the secret code for enrolling students into the course')
        ]

    def __str__(self):
        return self.fullname


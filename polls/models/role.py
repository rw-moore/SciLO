from django.db import models

class Role(models.Model):

    STUDENT = 1
    NONEDITING_TA = 2
    EDITING_TA = 3
    INSTRUCTOR = 4
    ROLE_CHOICES = (
        (STUDENT, 'student'),
        (NONEDITING_TA, 'nonediting ta'),
        (EDITING_TA, 'editing ta'),
        (INSTRUCTOR, 'instructor'),
    )
    role = models.PositiveSmallIntegerField(choices=ROLE_CHOICES, default=STUDENT)
    course = models.ForeignKey('Course', on_delete=models.CASCADE, blank=True, null=True, related_name='roles')
    user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, blank=True, null=True)
    models.UniqueConstraint(fields=['course', 'user'], name='unique_role')

    def __str__(self):
        return 'course: '+self.course.shortname+' user: '+str(self.user)

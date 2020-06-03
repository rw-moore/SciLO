from django.db import models

class UserRole(models.Model):

    role = models.ForeignKey('Role', on_delete=models.CASCADE, related_name='user_role')
    course = models.ForeignKey('Course', on_delete=models.CASCADE, blank=True, null=True, related_name='user_role')
    user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, blank=True, null=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['course_id', 'user_id'], name='unique_role')
        ]

    def __str__(self):
        return 'course: '+self.course.shortname+' user: '+str(self.user)

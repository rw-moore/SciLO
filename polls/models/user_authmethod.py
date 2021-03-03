from django.db import models

class UserAuthMethod(models.Model):

    method = models.ForeignKey('AuthMethod', on_delete=models.CASCADE, related_name='user_authmethod')
    user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, blank=True, null=True, related_name='user_authmethod')
    value = models.BooleanField(default=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['method_id', 'user_id'], name='unique_methods')
        ]

    def __str__(self):
        return 'method: '+str(self.method)+' user: '+str(self.user)

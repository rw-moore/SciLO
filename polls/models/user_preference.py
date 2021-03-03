from django.db import models

class UserPreference(models.Model):

    preference = models.ForeignKey('Preference', on_delete=models.CASCADE, related_name='user_preference')
    user = models.ForeignKey('UserProfile', on_delete=models.CASCADE, blank=True, null=True, related_name='user_preference')
    value = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['preference_id', 'user_id'], name='unique_preference')
        ]

    def __str__(self):
        return 'preference: '+str(self.preference)+' user: '+str(self.user)

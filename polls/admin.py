from django.contrib import admin

# Register your models here.
from .models import (Question,
                     UserProfile,
                     QuizCategory,
                     QuestionCategory,
                     Response,
                     Answer,
                     ResponseAttempt,
                     QuestionAttempt,
                     QuizAttempt)

admin.site.register(Question)
admin.site.register(UserProfile)
admin.site.register(QuizCategory)
admin.site.register(QuestionCategory)
admin.site.register(Answer)
admin.site.register(Response)
admin.site.register(QuestionAttempt)
admin.site.register(QuizAttempt)
admin.site.register(ResponseAttempt)

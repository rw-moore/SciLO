from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.user import UserProfile

admin.site.register(UserProfile, UserAdmin)
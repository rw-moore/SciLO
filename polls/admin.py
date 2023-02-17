from django.contrib import admin
from django.contrib.auth.models import Permission
from .models import UserProfile, Course, UserRole, Role, Preference, AuthMethod, UserAuthMethod, LTISecrets

class UserAdmin(admin.ModelAdmin):
    fields = ['username', 'email', 'first_name', 'last_name', 'institute', 'avatar', 'avatarurl']
    search_fields = ['username', 'first_name', 'last_name']

admin.site.register(UserProfile, UserAdmin)

class CourseAdmin(admin.ModelAdmin):
    fields = ['shortname', 'fullname', 'secret_code', 'enroll_role']
    search_fields = ['shortname', 'fullname']

admin.site.register(Course, CourseAdmin)

class RoleAdmin(admin.ModelAdmin):
    search_fields = ['permissions__codename', 'permissions__name']
    filter_horizontal = ['permissions']

admin.site.register(Role, RoleAdmin)

class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'role']
    search_fields = ['role__role_name', 'role__permissions__codename', 'role__permissions__name', 'user__first_name', 'user__last_name', 'user__email', 'user__username', 'course__shortname', 'course__fullname']

admin.site.register(UserRole, UserRoleAdmin)

class PreferenceAdmin(admin.ModelAdmin):
    list_display = ['title']

admin.site.register(Preference, PreferenceAdmin)

class AuthMethodAdmin(admin.ModelAdmin):
    fields = ['method']
    actions = ['disable_sitewide', 'enable_sitewide']
    def disable_sitewide(self, request, queryset):
        myset = UserAuthMethod.objects.filter(method__in=queryset).distinct()
        for user_authmethod in myset:
            user_authmethod.value = False
            user_authmethod.save()

    def enable_sitewide(self, request, queryset):
        myset = UserAuthMethod.objects.filter(method__in=queryset).distinct()
        for user_authmethod in myset:
            user_authmethod.value = True
            user_authmethod.save()

admin.site.register(AuthMethod, AuthMethodAdmin)
admin.site.register(Permission)
admin.site.register(LTISecrets)
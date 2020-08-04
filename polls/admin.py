from django.contrib import admin
from django.contrib.auth.models import Permission
from .models import UserProfile, Course, UserRole, Role, AuthMethod

class UserAdmin(admin.ModelAdmin):
    fields = ['username', 'email', 'first_name', 'last_name', 'institute', 'avatar', 'avatarurl', 'auth_methods']
    search_fields = ['username', 'first_name', 'last_name']
    filter_horizontal = ['auth_methods']

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

class AuthMethodAdmin(admin.ModelAdmin):
    fields = ['method']
    actions = ['disable_sitewide', 'enable_sitewide']
    def disable_sitewide(self, request, queryset):
        myset = UserProfile.objects.filter(auth_methods__in=queryset).distinct()
        for user in myset:
            user.auth_methods.remove(*queryset)
            user.save()

    def enable_sitewide(self, request, queryset):
        myset = UserProfile.objects.all()
        for user in myset:
            user.auth_methods.add(*queryset)
            user.save()

admin.site.register(AuthMethod, AuthMethodAdmin)
admin.site.register(Permission)

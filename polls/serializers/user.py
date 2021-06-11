from collections import OrderedDict
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from polls.models import UserProfile, UserRole, UserAuthMethod, UserPreference, Course, AuthMethod, Preference
from .utils import FieldMixin
from .role import RoleSerializer


class UserSerializer(FieldMixin, serializers.ModelSerializer):
    institute = serializers.CharField(required=False, allow_blank=True)
    email_active = serializers.BooleanField()
    is_staff = serializers.BooleanField(required=False)
    avatar = serializers.ImageField(
        allow_empty_file=False,
        required=False)
    authmethods = serializers.SerializerMethodField()
    preferences = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = (
            'id', 'institute', 'last_login',
            'username', 'first_name', 'last_name',
            'email', 'is_active', 'date_joined',
            'password', 'is_staff', 'avatar', 'email_active', 'avatarurl', 'authmethods', 'preferences'
        )
        read_only_fields = ('is_active', 'is_staff', 'email_active')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_internal_value(self, data):
        print('internal', data)
        auth_methods = data['authmethods'] if 'authmethods' in data else None
        preferences = data['preferences'] if 'preferences' in data else None
        data = super().to_internal_value(data)
        data['email_active'] = False
        if preferences is not None:
            data['preferences'] = preferences
        if auth_methods is not None:
            data['authmethods'] = auth_methods
            if not any(auth_methods.values()):
                raise serializers.ValidationError('At least one login method must be enabled')
        try:
            if data.get('password', None) is not None:
                validate_password(data.get('password'))
        except ValidationError as error:
            raise serializers.ValidationError({"password": list(error)})
        return data

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        if obj_dict.get('avatar', None):
            if obj.avatar:
                obj_dict['avatar'] = '/api/userprofile/{}/avatar'.format(obj.id)
            else:
                obj_dict['avatar'] = None
        if self.context.get('userprofile', {}):
            obj_dict['can_view_questionbank'] = obj.can_view_questionbank()
            obj_dict['roles'] = dict()
            for course in Course.objects.all():
                try:
                    role = UserRole.objects.get(user=obj, course=course).role
                    serializer = RoleSerializer(role)
                    if serializer.is_valid():
                        obj_dict['roles'][course.id] = serializer.data
                        obj_dict['roles'][course.id]['course'] = course.shortname
                    else:
                        print(serializer.errors)
                except UserRole.DoesNotExist:
                    continue

        if self.context.get('role', {}):
            if self.context.get('course', {}):
                obj_dict['role'] = UserRole.objects.get(user=obj, course=self.context.get('course')).role.role_name
        return obj_dict

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        print('serializer create')
        for method in AuthMethod.objects.all():
            UserAuthMethod.objects.create(user=user, method=method, value=True)
        for pref in Preference.objects.all():
            UserPreference.objects.create(user=user, preference=pref)
        return user

    def update(self, instance, validated_data):
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if 'authmethods' in validated_data:
            self.update_auth_methods(instance, validated_data)
        if 'preferences' in validated_data:
            self.update_preferences(instance, validated_data)
        return instance

    def get_authmethods(self, obj):
        UserMethods = OrderedDict()
        for authmethod in UserAuthMethod.objects.filter(user=obj):
            UserMethods[str(authmethod.method)] = authmethod.value
        return UserMethods

    def get_preferences(self, obj):
        UserPreferences = OrderedDict()
        for preference in UserPreference.objects.filter(user=obj):
            UserPreferences[str(preference.preference)] = preference.value
        return UserPreferences

    def update_auth_methods(self, instance, validated_data):
        for name, val in validated_data['authmethods'].items():
            method = AuthMethod.objects.get(method=name)
            usermethod = UserAuthMethod.objects.get(user=instance, method=method)
            usermethod.value = val
            usermethod.save()

    def update_preferences(self, instance, validated_data):
        for name, val in validated_data['preferences'].items():
            pref = Preference.objects.get(title=name)
            userpref = UserPreference.objects.get(user=instance, preference=pref)
            userpref.value = val
            userpref.save()

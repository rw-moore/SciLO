from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
# from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError
from polls.models import UserProfile, UserRole, Course
from .utils import FieldMixin
from .role import RoleSerializer


class UserSerializer(FieldMixin, serializers.ModelSerializer):
    institute = serializers.CharField(required=False, allow_blank=True)
    email_active = serializers.BooleanField()
    is_staff = serializers.BooleanField(required=False)
    avatar = serializers.ImageField(
        allow_empty_file=False,
        required=False)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'institute', 'last_login',
            'username', 'first_name', 'last_name',
            'email', 'is_active', 'date_joined',
            'password', 'is_staff', 'avatar', 'email_active',
        )
        read_only_fields = ('is_active', 'is_staff', 'email_active')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        data['email_active'] = False
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
        return user

    def update(self, instance, validated_data):
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        return instance

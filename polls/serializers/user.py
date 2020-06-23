from collections import OrderedDict
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from polls.models import UserProfile, UserRole, Course, AuthMethod
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
    class Meta:
        model = UserProfile
        fields = (
            'id', 'institute', 'last_login',
            'username', 'first_name', 'last_name',
            'email', 'is_active', 'date_joined',
            'password', 'is_staff', 'avatar', 'email_active', 'avatarurl', 'authmethods'
        )
        read_only_fields = ('is_active', 'is_staff', 'email_active')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_internal_value(self, data):
        auth_methods = data['authmethods'] if 'authmethods' in data else None
        data = super().to_internal_value(data)
        data['email_active'] = False
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
        for method in AuthMethod.objects.all():
            user.auth_methods.add(method)
        return user

    def update(self, instance, validated_data):
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if 'authmethods' in validated_data:
            instance = self.update_auth_methods(instance, validated_data)
        return instance

    def get_authmethods(self, obj):
        UserMethods = OrderedDict()
        for method in AuthMethod.objects.all():
            if method in obj.auth_methods.all():
                UserMethods[method.method] = True
            else:
                UserMethods[method.method] = False
        return UserMethods

    def update_auth_methods(self, instance, validated_data):
        myauth = [auth.method for auth in instance.auth_methods.all()]
        for name in validated_data['authmethods'].items():
            if name[1]:
                if name[0] not in myauth:
                    instance.auth_methods.add(AuthMethod.objects.get(method=name[0]))
            else:
                if name[0] in myauth:
                    instance.auth_methods.remove(AuthMethod.objects.get(method=name[0]))
        return instance

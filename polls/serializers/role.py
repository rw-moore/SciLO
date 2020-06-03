from rest_framework import serializers
from polls.models import Role, UserRole
from .user import UserSerializer
from .utils import FieldMixin

class RoleSerializer(FieldMixin, serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        if kwargs['course']:
            self.course = kwargs['course']
            kwargs.pop('course')
        super().__init__(args, kwargs)

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        obj_dict['name'] = obj.role_name
        return obj_dict

    def get_users(self, obj):
        if self.course:
            matches = UserRole.objects.filter(role=obj, course=self.course)
        else:
            matches = UserRole.objects.filter(role=obj)
        serializer = UserSerializer([role.user for role in matches], context=self.context.get('users_context', {}), many=True)
        return serializer.data

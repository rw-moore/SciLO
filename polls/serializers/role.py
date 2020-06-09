from rest_framework import serializers
from polls.models import Role
from .utils import FieldMixin

class RoleSerializer(FieldMixin, serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()
    class Meta:
        model = Role
        fields = ('id', 'role_name', 'permissions')
        extra_kwargs = {'role_name': {'required': False}}

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        if isinstance(obj, tuple):
            obj_dict['name'] = obj[0].role_name
        else:
            obj_dict['name'] = obj.role_name
        return obj_dict

    def get_permissions(self, obj):
        if isinstance(obj, tuple):
            perms = obj[0].permissions.all()
        else:
            perms = obj.permissions.all()
        out = set()
        for perm in perms:
            out.add(perm.codename)
        return out

    def get_role_name(self, obj):
        if isinstance(obj, tuple):
            return obj[0].role_name
        else:
            return obj.role_name

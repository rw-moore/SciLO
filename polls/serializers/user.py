from rest_framework import serializers
from polls.models import User, UserProfile, Group
from .utils import FieldMixin


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'


class UserSerializer(FieldMixin, serializers.ModelSerializer):
    institute = serializers.CharField(source='profile.institute', required=False)

    class Meta:
        model = User
        fields = (
            'id', 'institute', 'last_login',
            'username', 'first_name', 'last_name',
            'email', 'is_active', 'date_joined',
            'password', 'is_staff',
        )
        read_only_fields = ('is_active', 'is_staff')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def to_internal_value(self, data):
        institute = data.pop('institute', None)
        data = super().to_internal_value(data)
        data['institute'] = institute
        return data

    def create(self, validated_data):
        institute = validated_data.pop('institute', None)
        user = User.objects.create_user(**validated_data)
        user.profile.institute = institute
        return user

    def update(self, instance, validated_data):
        institute = validated_data.get('institute', None)
        super().update(instance, validated_data)
        instance.profile.institute = institute
        return instance


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = '__all__'

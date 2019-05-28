from rest_framework import serializers
from polls.models import Tag
from .utils import FieldMixin


class TagListSerializer(FieldMixin, serializers.ListSerializer):
    def create(self, validated_data):
        Tags = [Tag.objects.get_or_create(**item)[0] for item in validated_data]
        return Tags


class TagSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
        list_serializer_class = TagListSerializer

    def to_representation(self, obj):
        return {'id': obj.id, 'name': obj.name}

    def to_internal_value(self, data):
        data = {'name': data.get('name', None)}
        return self.validate(data)

    def validate(self, data):
        value = data['name']
        if value == '' or value is None:
            raise serializers.ValidationError("name can not be null")
        return data

    def create(self, validated_data):
        return Tag.objects.get_or_create(**validated_data)[0]

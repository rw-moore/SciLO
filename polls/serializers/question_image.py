from rest_framework import serializers
from polls.models import QuestionImage
from .utils import FieldMixin


class QuestionImageListSerializer(FieldMixin, serializers.ListSerializer):
    def create(self, validated_data):
        QuestionImages = [QuestionImage.objects.get_or_create(**item)[0] for item in validated_data]
        return QuestionImages


class QuestionImageSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = QuestionImage
        fields = '__all__'
        list_serializer_class = QuestionImageListSerializer

    def to_representation(self, obj):
        data = super().to_representation(obj)
        return data

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return data

    def validate(self, data):
        value = data['name']
        if value == '' or value is None:
            raise serializers.ValidationError("name can not be null")
        return data

    def create(self, validated_data):
        return QuestionImage.objects.get_or_create(**validated_data)[0]

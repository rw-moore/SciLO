from rest_framework import serializers
from polls.models import Tag
from .utils import FieldMixin


class TagSerializer(FieldMixin, serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ['name']
    
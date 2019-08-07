from rest_framework import serializers
from polls.models import Answer
from .utils import FieldMixin


class EmailCodeSerializer(FieldMixin, serializers.ModelSerializer):

    class Meta:
        model = Answer
        fields = (
            'author',
            'token'
        )

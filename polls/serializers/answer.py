from rest_framework import serializers
from polls.models import Answer
from .utils import FieldMixin


class AnswerSerializer(FieldMixin, serializers.ModelSerializer):

    class Meta:
        model = Answer
        fields = (
            'response',
            'text',
            'identifier',
            'grade',
            'comment',
        )
        extra_kwargs = {
            'response': {'write_only': True}
        }

from rest_framework import serializers
from polls.models import ResponseAttempt
from .utils import FieldMixin


class ResponseAttemptSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = ResponseAttempt
        fields = [
            'id',
            'grade',
            'answers_string',
            'response',
            'question_attempt'
        ]
        read_only_fields = ['id', 'grade', ]

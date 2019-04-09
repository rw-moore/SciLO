from polls.models import ResponseAttempt
from rest_framework import serializers
from .response import ResponseSerializer
from .user import UserSerializer
from .utils import FieldMixin

class ResponseAttemptSerializer(FieldMixin, serializers.ModelSerializer):
    # response_attempts = 
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
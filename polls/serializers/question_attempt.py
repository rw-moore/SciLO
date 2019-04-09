from polls.models import QuestionAttempt
from rest_framework import serializers
from .response_attempt import ResponseAttemptSerializer
from .question import QuestionSerializer
from .response import ResponseSerializer
from .utils import FieldMixin


class QuestionAttemptSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = ['id','grade']
        read_only_fields = ['id', 'grade', ]

    def to_representation(self, obj):

        obj_dict = super().to_representation(obj)

        serializer = ResponseAttemptSerializer(obj.response_attempts, many=True, read_only=True)
        obj_dict['response_attempts'] = serializer.data

        serializer = QuestionSerializer(
            obj.question, read_only=True,
            context={"fields": ["id", "background", "title", ], "to_representation": False}
        )
        obj_dict['question'] = serializer.data

        serializer = ResponseSerializer(
            obj.question.responses.all(),
            read_only=True,
            many=True,
            context={"fields": ["id", "name", "content"], "to_representation": False}
        )
        obj_dict['question']['responses'] = serializer.data

        serializer = ResponseAttemptSerializer(
            obj.response_attempts,
            read_only=True,
            many=True
        )
        obj_dict['response_attempts'] = serializer.data

        return obj_dict

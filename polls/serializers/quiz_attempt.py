from rest_framework import serializers
from polls.models import QuizAttempt
from .question_attempt import QuestionAttemptSerializer
from .user import UserSerializer
from .quiz import QuizSerializer
from .utils import FieldMixin


class QuizAttemptSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'grade',
            'quiz',
            'author',
        ]
        read_only_fields = ['id', 'grade', ]

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)

        serializer = QuestionAttemptSerializer(
            obj.question_attempts.order_by("question__questionlinkback__position"),
            many=True, read_only=True
        )
        obj_dict['question_attempts'] = serializer.data

        serializer = UserSerializer(obj.author)
        obj_dict['author'] = serializer.data

        serializer = QuizSerializer(obj.quiz, context={"fields": ["id", "title", ], "to_representation": False})
        obj_dict['quiz'] = serializer.data

        return obj_dict

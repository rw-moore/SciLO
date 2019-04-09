
from rest_framework import serializers
from polls.models import Quiz, QuizAttempt, QuizQuestion
from polls.serializers import QuestionSerializer, UserSerializer
from .utils import FieldMixin


class QuizSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = (
            'id',
            'title',
            'description',
            'weight',
            'bonus',
            'create_date',
            'last_modify_date',
            'category',
        )

    def to_representation(self, obj):
        is_to_representation = self.context.get('to_representation', True)
        obj_dict = super().to_representation(obj)
        if is_to_representation:
            author = UserSerializer(obj.author).data
            obj_dict['author'] = author
            # order by position
            serializer = QuestionSerializer(obj.questions.all().order_by('questionlinkback__position'), many=True)
            obj_dict['questions'] = serializer.data

        return obj_dict

    def to_internal_value(self, data):
        questions = data.pop('questions', [])
        data = super().to_internal_value(data)
        data['questions'] = questions
        return data

    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        quiz = super().create(validated_data)
        quiz.update_quiz_question_links(questions)
        return quiz

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions', [])
        quiz = super().update(instance, validated_data)
        quiz.update_quiz_question_links(questions)
        return quiz


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['position', ]

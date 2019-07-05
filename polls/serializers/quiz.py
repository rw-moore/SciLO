from django.utils.dateparse import parse_datetime
from rest_framework import serializers
from polls.models import Quiz, QuizQuestion
from .user import UserSerializer
from .question import QuestionSerializer
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
            'begin_date',
            'end_date',
            'last_modify_date',
            'options'
        )

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        # convert back to 'start-end-time'
        obj_dict['start_end_time'] = [obj_dict.pop('begin_date', None), obj_dict.pop('end_date', None)]

        author = UserSerializer(obj.author).data
        obj_dict['author'] = author

        serializer = QuestionSerializer(obj.questions.all().order_by('questionlinkback__position'), many=True)
        obj_dict['questions'] = serializer.data

        return obj_dict

    def to_internal_value(self, data):
        dates = data.pop('start_end_time', None)
        if dates and isinstance(dates, list) and len(dates) == 2:
            data['begin_date'] = parse_datetime(dates[0])
            data['end_date'] = parse_datetime(dates[1])
        questions = data.pop('questions', None)
        data = super().to_internal_value(data)
        data['questions'] = questions
        return data

    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        quiz = super().create(validated_data)
        quiz.update_quiz_question_links(questions)
        return quiz

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions', None)
        if not self.partial: # if PUT
            # reset end_date, begin_date if they are not provided
            validated_data['end_date'] = validated_data.pop('end_date', None)
            validated_data['begin_date'] = validated_data.pop('begin_date', None)
            # reset questions
            if questions is None:
                questions = []

        quiz = super().update(instance, validated_data)
        quiz.update_quiz_question_links(questions)

        return quiz


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['position', ]

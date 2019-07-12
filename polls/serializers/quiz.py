from datetime import datetime, timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers
from polls.models import Quiz, QuizQuestion
from .user import UserSerializer
from .question import QuestionSerializer
from .utils import FieldMixin


def validated_questions(questions):
    for q in questions:
        if q.get('id', None) is None:
            raise Exception("each question in questions must contain id")


def compute_quiz_status(start, end, late):
    status = None
    now = datetime.now(timezone.utc)

    if start and now < start:
        status = 'not start'
    if end and start and now > start and now < end: # pylint:disable=chained-comparison
        status = 'processing'
    if end and now > end:
        if (late and now > late) or late is None:
            status = 'done'
        else:
            status = 'late'

    return status


class QuizSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = (
            'id',
            'title',
            'bonus',
            'begin_date',
            'end_date',
            'last_modify_date',
            'show_solution_date',
            'late_time',
            'options'
        )

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        # convert back to 'start-end-time'
        obj_dict['start_end_time'] = [obj_dict.pop('begin_date', None), obj_dict.pop('end_date', None)]

        if self.context.get('author_detail', True):
            author = UserSerializer(obj.author).data
            obj_dict['author'] = author
        else:
            if obj.author:
                obj_dict['author'] = obj.author.id
            else:
                obj_dict['author'] = None

        if self.context.get('question_detail', True):
            serializer = QuestionSerializer(obj.questions.all().order_by('questionlinkback__position'), many=True)
            obj_dict['questions'] = serializer.data
        else:
            obj_dict['questions'] = [q.id for q in obj.questions.all().order_by('questionlinkback__position')]

        obj_dict['status'] = compute_quiz_status(
            obj.begin_date, obj.end_date, obj.late_time)
        return obj_dict

    def to_internal_value(self, data):
        dates = data.pop('start_end_time', None)
        if dates and isinstance(dates, list) and len(dates) == 2:
            data['begin_date'] = parse_datetime(dates[0])
            data['end_date'] = parse_datetime(dates[1])
            # show_solution_date must be bigger than end date
            if data.get('show_solution_date', None) is None:
                data['show_solution_date'] = parse_datetime(dates[1])
            else:
                data['show_solution_date'] = parse_datetime(data['show_solution_date'])
            if data['show_solution_date'] < data['end_date']:
                raise Exception('End date should bigger than show solution date')

        questions = data.pop('questions', None)
        data = super().to_internal_value(data)
        validated_questions(questions)  # check if each question has a id
        data['questions'] = questions
        return data

    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        quiz = super().create(validated_data)
        quiz.update_quiz_question_links(questions)
        return quiz

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions', None)
        if not self.partial:  # if PUT
            # reset end_date, begin_date if they are not provided
            validated_data['end_date'] = validated_data.pop('end_date', None)
            validated_data['begin_date'] = validated_data.pop('begin_date', None)
            # reset questions
            if questions is None:
                questions = []
        if self.partial:
            # if partial and not update end_date, check instance's end_date
            if validated_data.get('end_date', None) is None and instance.end_date:
                if validated_data['show_solution_date'] < instance.end_date:
                    raise Exception('End date should bigger than show solution date')

        quiz = super().update(instance, validated_data)
        quiz.update_quiz_question_links(questions)

        return quiz


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['position', ]

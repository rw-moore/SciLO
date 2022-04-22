from datetime import datetime, timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers
from polls.models import Quiz, QuizQuestion
from .question import QuestionSerializer
from .utils import FieldMixin


def validated_questions(questions):
    if questions is None:
        return
    for q in questions:
        if q.get('id', None) is None:
            raise Exception("each question in questions must contain id")


def compute_quiz_status(start, end, late):
    status = None
    now = datetime.now(timezone.utc)

    if start and now < start:
        status = 'not_begin'
    elif end is None and start and now > start:
        status = 'processing'
    elif end and start and now > start and now < end:  # pylint:disable=chained-comparison
        status = 'processing'
    elif end and now > end:
        if (late and now > late) or late is None:
            status = 'done'
        else:
            status = 'late'
    if status is None:
        status = 'processing'

    return status


class QuizSerializer(FieldMixin, serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = '__all__'

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)

        if obj_dict.get('questions', None):
            question_quiz_list = QuizQuestion.objects.filter(quiz_id=obj.id).order_by('position')
            serializer = QuestionSerializer(
                obj.questions.all().order_by('questionlinkback__position'),
                context=self.context.get('question_context', {}),
                many=True)
            obj_dict['questions'] = serializer.data
            for index, qqlink in enumerate(question_quiz_list):
                if str(obj_dict['questions'][index]['id']) == str(qqlink.question_id):
                    if qqlink.mark:
                        obj_dict['questions'][index]['mark'] = qqlink.mark
                else:
                    raise Exception('question order does not work properly')

        return obj_dict

    def validated_date_times(self, begin, end, late):
        if begin:
            end2 = begin if end is None else end
            late2 = end2 if late is None else late
            
            try:
                begin = parse_datetime(begin)
                end2 = parse_datetime(end2)
                late2 = parse_datetime(late2)
            except Exception as e:
                raise serializers.ValidationError({"error":e})
            if begin <= end2 <= late2: # pylint:disable=chained-comparison
                return begin, end, late
            else:
                raise serializers.ValidationError({"error": "begin < end <= late"})
        else:
            return None, None, None

    def to_internal_value(self, data):
        start_date = data.get('start_date', None)
        end_date = data.get('end_date', None)
        late_time = data.get('late_time', None)
        data['start_date'], data['end_date'], data['late_time'] = self.validated_date_times(start_date, end_date, late_time)
        data['last_modify_date'] = parse_datetime(data.get('last_modify_date'))

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

    def update(self, instance, data):
        questions = data.pop('questions', None)
        if not self.partial:  # if PUT
            # reset questions
            if questions is None:
                questions = []
        # if self.partial:
        #     # if partial and not update end_date, check instance's end_date

        quiz = super().update(instance, data)
        quiz.update_quiz_question_links(questions)

        return quiz

    def get_status(self, obj):
        return compute_quiz_status(obj.start_date, obj.end_date, obj.late_time)


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['position', ]

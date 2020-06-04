from rest_framework import serializers
from polls.models import Course, Role
from .question import QuestionSerializer
from .role import RoleSerializer
from .utils import FieldMixin


class CourseSerializer(FieldMixin, serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        serializer = RoleSerializer(Role.objects.all(), many=True, context=self.context.get('groups_context', {}), course=obj)
        obj_dict['groups'] = serializer.data
        return obj_dict

    def get_questions(self, obj):
        serializer = QuestionSerializer(
            obj.questions.all(),
            context=self.context.get('question_context', {}),
            many=True)
        return serializer.data

from collections import OrderedDict
from rest_framework import serializers
from polls.models import Course, Role, UserRole
from .question import QuestionSerializer
from .user import UserSerializer
from .utils import FieldMixin


class CourseSerializer(FieldMixin, serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    secret_code = serializers.SerializerMethodField()
    enroll_role = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        obj_dict['groups'] = []
        index = 0
        for role in Role.objects.all():
            obj_dict['groups'].append(OrderedDict())
            obj_dict['groups'][index]['id'] = role.id
            obj_dict['groups'][index]['name'] = role.role_name
            obj_dict['groups'][index]['role_name'] = role.role_name
            userroles = UserRole.objects.filter(course=obj, role=role)
            serializer = UserSerializer([userrole.user for userrole in userroles], many=True, context=self.context.get('groups_context', {}).get('users_context', {}))
            obj_dict['groups'][index]['users'] = serializer.data
            index += 1
        return obj_dict

    def get_questions(self, obj):
        serializer = QuestionSerializer(
            obj.questions.all(),
            context=self.context.get('question_context', {}),
            many=True)
        return serializer.data

    def get_secret_code(self, obj):
        return obj.secret_code

    def get_enroll_role(self, obj):
        if obj.enroll_role:
            return obj.enroll_role.role_name
        return obj.enroll_role
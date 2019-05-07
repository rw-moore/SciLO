from rest_framework import serializers
from polls.models import QuestionCategory, QuizCategory, Quiz
from .user import UserSerializer
from .utils import FieldMixin


class QuestionCategorySerializer(FieldMixin, serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all(), many=True, read_only=False)
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = QuestionCategory
        fields = '__all__'
        extra_kwargs = {
            'parent': {'required': False}
        }

    def get_children(self, obj):
        children = [QuestionCategorySerializer(child).data
                    for child in obj.children.all()]
        return children

    def to_representation(self, obj):
        field_names = self.context.get('fields', None)
        obj_dict = super().to_representation(obj)
        obj_dict['type'] = 'question_category'
        if obj.author and field_names and 'author' in field_names:
            author = UserSerializer(obj.author).data
            obj_dict['author'] = author
        return obj_dict


class QuizCategorySerializer(serializers.ModelSerializer):
    quizzes = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all(), many=True, read_only=False)
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = QuizCategory
        fields = '__all__'
        extra_kwargs = {
            'parent': {'required': False}
        }

    def get_children(self, obj):
        if isinstance(obj, QuizCategory):
            children = [QuizCategorySerializer(child).data
                        for child in obj.children.all()]
        else:
            children = []
        return children

    def to_representation(self, obj):
        field_names = self.context.get('fields', None)
        obj_dict = super().to_representation(obj)
        obj_dict['type'] = 'quiz_category'
        if obj.author and field_names and 'author' in field_names:
            author = UserSerializer(obj.author).data
            obj_dict['author'] = author
        return obj_dict

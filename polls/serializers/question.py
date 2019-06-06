from functools import reduce
from rest_framework import serializers
from django.db.models import Q
from polls.models import Question, Tag
from .response import ResponseSerializer
from .user import UserSerializer
from .tag import TagSerializer
from .utils import FieldMixin
from .variable import VariableSerializer


def variables_validation(variables):
    names = [item['name'] for item in variables]
    if len(names) != len(set(names)):
        error = {'message': 'variable.name in question.variables is unique'}
        raise serializers.ValidationError(error)


def responses_validation(responses, pk):
    for i, response in enumerate(responses):
        rid = response.get('question', None)
        if rid:
            error = {'message': ' response.question should be null'}
            raise Exception(error)
        response['question'] = pk
        response['index'] = i
    return responses


class QuestionSerializer(FieldMixin, serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    variables = serializers.ListField(child=VariableSerializer(), required=False)

    class Meta:
        model = Question
        fields = '__all__'

    def to_representation(self, obj):
        is_to_representation = self.context.get('to_representation', True)
        obj_dict = super().to_representation(obj)
        if is_to_representation:
            if obj.author:
                author = UserSerializer(obj.author).data
                obj_dict['author'] = author
            else:
                obj_dict['author'] = None

            serializer = ResponseSerializer(obj.responses.all(), many=True)
            obj_dict['responses'] = serializer.data
        return obj_dict

    def to_internal_value(self, data):
        responses = data.get('responses', [])
        variables = data.get('variables', [])
        variables_validation(variables)
        data = super().to_internal_value(data)
        data['responses'] = responses
        return data

    def set_responses(self, question, responses):
        responses = responses_validation(responses, question.pk)
        question.responses.all().delete()
        serializer = ResponseSerializer(data=responses, many=True)
        if serializer.is_valid():
            serializer.save()
        else:
            question.delete()
            raise serializers.ValidationError(serializer.errors)

    def set_tags(self, question, tags):
        # set tags to a given question
        if not tags:
            return
        serializer = TagSerializer(data=tags, many=True)
        if serializer.is_valid():
            serializer.save()
        else:
            question.delete()
            raise serializers.ValidationError(serializer.errors)

        queryset = Tag.objects.filter(reduce(lambda x, y: x | y, [Q(**tag) for tag in tags]))
        question.tags.clear()
        question.tags.set(queryset)

    def create(self, validated_data):
        # add tags
        responses = validated_data.pop('responses', [])
        tags = validated_data.pop('tags', [])
        question = Question.objects.create(**validated_data)
        self.set_tags(question, tags)
        self.set_responses(question, responses)
        return question

    def update(self, instance, validated_data):
        responses = validated_data.pop('responses', None)
        tags = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if tags:
            self.set_tags(instance, tags)
        if responses:
            self.set_responses(instance, responses)
        return instance

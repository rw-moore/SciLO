from rest_framework import serializers
from polls.models import Question
from .response import ResponseSerializer
from .user import UserSerializer
from .utils import FieldMixin


def responses_validation(responses, pk):
    for response in responses:
        rid = response.get('question', None)
        if rid and int(rid) != int(pk):
            # if update, and rid is not pk
            raise serializers.ValidationError("responses'id are not matched")
        response['question'] = pk
    return responses


class QuestionSerializer(FieldMixin, serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = '__all__'

    def to_representation(self, obj):
        is_to_representation = self.context.get('to_representation', True)
        obj_dict = super().to_representation(obj)
        if is_to_representation:
            author = UserSerializer(obj.author).data
            obj_dict['author'] = author

            serializer = ResponseSerializer(obj.responses.all(), many=True)
            obj_dict['responses'] = serializer.data
        return obj_dict

    def to_internal_value(self, data):
        responses = data.pop('responses', [])
        data = super().to_internal_value(data)
        data['responses'] = responses
        return data

    def create(self, validated_data):
        responses = validated_data.pop('responses', [])
        question = Question.objects.create(**validated_data)
        responses = responses_validation(responses, question.pk)
        serializer = ResponseSerializer(data=responses, many=True)
        if serializer.is_valid():
            serializer.save()
            return question
        else:
            question.delete()
            raise Exception(serializer.errors)

    def update(self, instance, validated_data):
        responses = validated_data.pop('responses', None)
        instance = super().update(instance, validated_data)
        if responses:
            instance.responses.all().delete()
            responses = responses_validation(responses, instance.pk)
            serializer = ResponseSerializer(data=responses, many=True)
            if serializer.is_valid():
                serializer.save()
                return instance
            else:
                raise Exception(serializer.errors)
        else:
            return instance

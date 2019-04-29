from rest_framework import serializers
from polls.models import (
    Response, Answer,
    response_base_generate, response_base_parser,
    algorithm_base_parser, algorithm_base_generate)
from .answer import AnswerSerializer
from .utils import FieldMixin


class ResponseSerializer(FieldMixin, serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Response
        fields = '__all__'

    def to_representation(self, obj):
        is_to_representation = self.context.get('to_representation', True)
        obj_dict = super().to_representation(obj)
        obj_dict['grade_policy'] = obj.grade_policy.grade_policy_base_parser()
        if is_to_representation:
            if isinstance(obj.rtype, dict):
                obj_dict['rtype'] = obj.rtype
            else:
                obj_dict['rtype'] = response_base_parser(obj.rtype)
            if isinstance(obj.algorithm, dict):
                obj_dict['algorithm'] = obj.algorithm
            else:
                obj_dict['algorithm'] = algorithm_base_parser(obj.algorithm)
        else:
            if isinstance(obj.rtype, dict):
                obj_dict['rtype'] = obj.rtype
            else:
                obj_dict['rtype'] = response_base_parser(obj.rtype)
            obj_dict.pop('algorithm', None)
        
        return obj_dict

    def to_internal_value(self, data):
        answers = data.pop('answers', [])
        data = super().to_internal_value(data)
        data['answers'] = answers
        return data

    def create(self, validated_data):
        answers = validated_data.pop('answers', [])
        response = super().create(validated_data)
        for answer in answers:  # link answers to response
            answer['response'] = response.pk
        serializer = AnswerSerializer(data=answers, many=True)
        if serializer.is_valid():
            serializer.save()
            return response
        else:
            response.delete()
            raise Exception(serializer.errors)

    def update(self, instance, validated_data):
        # todo: update answers by id instead of deleting them
        answers = validated_data.pop('answers', None)
        instance = super().update(instance, validated_data)
        if answers:
            for answer in answers:  # link answers to response
                answer['response'] = instance.pk
            instance.answers.all().delete()
            serializer = AnswerSerializer(data=answers, many=True)
            if serializer.is_valid():
                serializer.save()
                return instance
            else:
                raise Exception(serializer.errors)
        else:
            return instance

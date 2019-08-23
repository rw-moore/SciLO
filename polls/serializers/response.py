from rest_framework import serializers
# pylint:disable=unused-import
from polls.models import (
    Response, Answer, GradePolicy,
    algorithm_base_parser, algorithm_base_generate,
    variable_base_parser, variable_base_generate)
from .answer import AnswerSerializer
from .utils import FieldMixin


class ResponseSerializer(FieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = ['id', 'index', 'text', 'question', 'mark', 'rtype']

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        if isinstance(obj.grade_policy, GradePolicy):
            obj_dict['grade_policy'] = obj.grade_policy.grade_policy_base_parser()
        if self.context.get('algorithm_detail', True):
            obj_dict['algorithm'] = algorithm_base_parser(obj.algorithm)
        else:
            obj_dict.pop('algorithm', None)
        obj_dict['type'] = obj_dict.pop('rtype')
        if self.context.get('answer_detail', True):
            obj_dict['answers'] = AnswerSerializer(obj.answers.all().order_by('id'), many=True).data

        return obj_dict

    def to_internal_value(self, data):
        answers = data.pop('answers', [])
        rtype = data.pop('type', None)
        if rtype:
            data['rtype'] = rtype
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
        return response

    def update(self, instance, validated_data):
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

import random
from rest_framework import serializers
# pylint:disable=unused-import
from polls.models import (
    Response, Answer, GradePolicy,
    algorithm_base_parser, algorithm_base_generate,
    variable_base_parser, variable_base_generate)
from .answer import AnswerSerializer
from .utils import FieldMixin


class ResponseSerializer(FieldMixin, serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = '__all__'

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        # grade policy should be displayed

        if obj_dict.get('grade_policy', None):
            if isinstance(obj.grade_policy, GradePolicy):
                obj_dict['grade_policy'] = obj.grade_policy.grade_policy_base_parser()

        # student should not see this, set algorithm_detail off
        if obj_dict.get('algorithm', None):
            obj_dict['algorithm'] = algorithm_base_parser(obj.algorithm)

        # student should not see this, set answer_detail off
        if obj_dict.get('rtype', None):
            obj_dict['type'] = obj_dict.pop('rtype')

        if obj_dict['type']['name'] == 'multiple':
            obj_dict['choices'] = list(map(
                lambda x: x['text'], AnswerSerializer(obj.answers.all().order_by('id'), many=True).data))
            if self.context.get('shuffle', False) and obj_dict['type'].get('shuffle', False):
                random.shuffle(obj_dict['choices'])

        return obj_dict

    def to_internal_value(self, data):
        answers = data.pop('answers', [])
        rtype = data.pop('type', None)
        gradepolicy = data.pop('grade_policy', None)
        if rtype:
            data['rtype'] = rtype
        gradepolicy = data.pop('grade_policy', None)
        data = super().to_internal_value(data)
        if gradepolicy:
            data['grade_policy'] = gradepolicy
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

    def get_answers(self, obj):
        return AnswerSerializer(
            obj.answers.all().order_by('id'),
            context=self.context.get('answer_context', {}),
            many=True).data

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
    grade_policy = serializers.SerializerMethodField()
    algorithm = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = '__all__'

    def to_representation(self, obj):
        print('to repr response')
        obj_dict = super().to_representation(obj)

        # student should not see this, set answer_detail off
        if obj_dict.get('rtype', None):
            obj_dict['type'] = obj_dict.pop('rtype')

        return obj_dict

    def to_internal_value(self, data):
        # print('to internal response')
        answers = data.pop('answers', [])
        rtype = data.pop('type', None)
        gradepolicy = data.pop('grade_policy', None)
        if rtype:
            data['rtype'] = rtype
        data = super().to_internal_value(data)
        if gradepolicy:
            data['grade_policy'] = gradepolicy
        data['answers'] = answers
        return data

    def create(self, validated_data):
        # print('create response')
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
            raise serializers.ValidationError(serializer.errors)
        return response

    def update(self, instance, validated_data):
        # print('update response')
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
                raise serializers.ValidationError(serializer.errors)
        else:
            return instance

    def get_answers(self, obj):
        print('get answers')
        answers = AnswerSerializer(
            obj.answers.all().order_by('id'),
            context=self.context.get('answer_context', {}),
            many=True).data
        if obj.rtype['name'] == "multiple":
            if self.context.get('shuffle', False) and obj.rtype.get('shuffle', False):
                random.shuffle(answers)
        return answers

    def get_grade_policy(self, obj):
        return obj.grade_policy.grade_policy_base_parser()

    def get_algorithm(self, obj):
        return algorithm_base_parser(obj.algorithm)

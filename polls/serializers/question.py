from functools import reduce
from rest_framework import serializers
from django.db.models import Q
from polls.models import Question, Tag, Algorithm, algorithm_base_parser, VariableType, variable_base_parser, variable_base_generate
from .response import ResponseSerializer
from .user import UserSerializer
from .tag import TagSerializer
from .utils import FieldMixin
# from .variable import VariableSerializer


def get_question_mark(responses):
    mark = 0
    for response in responses:
        mark += response['mark']
    return mark


def variables_validation(variables):
    if variables is None:
        return
    names = []
    for item in variables:
        if isinstance(item.get('name', None), str):
            names.append(item['name'])
        # if isinstance(item['name'], list): #ignore script
        #     names += item['name']
    if len(names) != len(set(names)):
        error = {'message': 'variable.name in question.variables is unique'}
        raise serializers.ValidationError(error)


def responses_validation(responses, pk):
    for i, response in enumerate(responses):
        rid = response.get('question', None)
        if rid:
            # error = {'message': ' response.question should be null'}
            # raise serializers.ValidationError(error)
            print('question pk={}, response qid={}'.format(pk, rid))
            print('Error: response.question should be null. Override this response id')
        response['question'] = pk
        response['index'] = i
    return responses


class QuestionSerializer(FieldMixin, serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    variables = serializers.SerializerMethodField()
    responses = serializers.SerializerMethodField()
    tree = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = '__all__'

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        if obj_dict.get('owner', None):
            serializer = UserSerializer(obj.owner, context=self.context.get('owner_context', {}))
            obj_dict['owner'] = serializer.data

        obj_dict['mark'] = get_question_mark(obj_dict.get('responses', []))

        return obj_dict

    def to_internal_value(self, data):
        responses = data.get('responses', None)
        tags = data.get('tags', None)
        tree = data.get('tree', None)
        my_vars = data.get('variables', None)
        data = super().to_internal_value(data)
        data['tree'] = tree
        data['tags'] = tags
        data['responses'] = responses
        data['variables'] = variable_base_generate(my_vars)
        return data

    def set_responses(self, question, responses):
        if responses is None:
            return
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
        if tags is None:
            return
        if tags == []:  # set empty
            question.tags.clear()
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

    def set_tree(self, question, tree):
        if tree is None:
            return
        question.tree = tree

    def create(self, validated_data):
        # add tags
        responses = validated_data.pop('responses')
        tags = validated_data.pop('tags')
        question = Question.objects.create(**validated_data)
        self.set_tags(question, tags)
        self.set_responses(question, responses)
        return question

    def update(self, instance, validated_data):
        responses = validated_data.pop('responses')
        tags = validated_data.pop('tags')

        if not self.partial:
            if responses is None:
                responses = []
            if tags is None:
                tags = []
            validated_data['text'] = validated_data.pop('text', '')
        instance = super().update(instance, validated_data)

        self.set_tags(instance, tags)
        self.set_responses(instance, responses)
        return instance

    def get_responses(self, obj):
        serializer = ResponseSerializer(obj.responses.all(),
                                        context=self.context.get('response_context', {}), many=True)
        return serializer.data

    def get_tree(self, obj):
        if isinstance(obj.tree, Algorithm):
            return algorithm_base_parser(obj.tree)
        return obj.tree

    def get_variables(self, obj):
        if isinstance(obj.variables, VariableType):
            return variable_base_parser(obj.variables)
        return obj.variables

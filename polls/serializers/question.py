from functools import reduce
from rest_framework import serializers
from django.db.models import Q
from polls.models import Question, Tag, Algorithm, algorithm_base_parser, VariableType, variable_base_parser, variable_base_generate
from .response import ResponseSerializer
from .user import UserSerializer
from .tag import TagSerializer
from .utils import FieldMixin
# from .variable import VariableSerializer


def get_question_mark(responses, tree):
    if 'type' not in tree.keys():
        return 0
    if tree['type'] == 0:
        return tree['score']
    elif tree['type'] == 2:
        for response in responses:
            if isinstance(response, dict) and response['identifier'] == tree['identifier']:
                return response['mark']
            elif not isinstance(response, dict) and response.identifier == tree['identifier']:
                return response.mark
        return 0
    marks = {'true':[], 'false':[]}
    for node in tree['children']:
        if node['bool']:
            marks['true'].append(get_question_mark(responses, node))
        else:
            marks['false'].append(get_question_mark(responses, node))
    mark = []
    for k, v in marks.items():
        if tree['type'] == -1:
            mark.append(sum(v))
        else:
            if tree['policy'][k] == 'sum':
                mark.append(sum(v))
            elif tree['policy'][k] == 'min':
                mark.append(min(v))
            elif tree['policy'][k] == 'max':
                mark.append(max(v))
            else:
                mark.append(0)
    return max(mark)


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
        obj_dict['mark'] = get_question_mark(obj_dict.get('responses', []), obj_dict.get('tree', {}))
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
        # print('set response')
        if responses is None:
            return
        responses = responses_validation(responses, question.pk)
        # question.responses.all().delete()
        for resp in question.responses.all():
            resp.index = -1*resp.index - 1
            # print(resp.question, resp.index)
            resp.save()
        for response in responses:
            # print(response)
            found = False
            try:
                for old_resp in question.responses.all():
                    if int(old_resp.id) == int(response['id']):
                        serializer = ResponseSerializer(old_resp, data=response)
                        if serializer.is_valid():
                            serializer.save()
                        else:
                            print('couldnt save pk = ',response['id'])
                            print(serializer.errors)
                            raise serializers.ValidationError(serializer.errors)
                        found = True
                        break
            except ValueError:
                pass
            if not found:
                # print('create resp')
                serializer = ResponseSerializer(data=response)
                if serializer.is_valid():
                    serializer.save()
                else:
                    print('couldnt save pk = ',response['id'])
                    print(serializer.errors)
                    raise serializers.ValidationError(serializer.errors)
        for resp in question.responses.all():
            if resp.index < 0:
                resp.delete()

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
        # print('update')
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
        # print('update end')
        return instance

    def get_responses(self, obj):
        serializer = ResponseSerializer(obj.responses.all(),
                                        context=self.context.get('response_context', {}), many=True)
        # print(serializer.data)

        return sorted(serializer.data, key=lambda x: x['index'])

    def get_tree(self, obj):
        if isinstance(obj.tree, Algorithm):
            return algorithm_base_parser(obj.tree)
        return obj.tree

    def get_variables(self, obj):
        if isinstance(obj.variables, VariableType):
            return variable_base_parser(obj.variables)
        return obj.variables

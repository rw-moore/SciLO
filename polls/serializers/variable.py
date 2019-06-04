
from rest_framework import serializers
from polls.models import variable_base_generate, variable_base_parser
from .utils import FieldMixin


class VariableSerializer(FieldMixin, serializers.Field):

    def to_representation(self, obj):
        if isinstance(obj, dict):
            return obj
        return variable_base_parser(obj)

    def to_internal_value(self, data):
        return variable_base_generate(data)

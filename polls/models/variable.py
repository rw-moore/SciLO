
import json
from django.db import models
from .utils import class_import


def variable_base_parser(instance):
    (_, args, kwargs) = instance.deconstruct()
    data = {'name': args[0], 'type': {}}
    for k, v in kwargs.items():
        data['type'][k] = v
    return data


def variable_base_generate(data):
    print(data)
    pattern = data.get('name') # name of variable
    vdata = data.get('type') # variable's type which contains a name
    VARIABLES = {'fix-single': 'polls.models.variable.FixSingleVariable',
                 'fix-list': 'polls.models.variable.FixListVariable', }
    variable = class_import(VARIABLES[vdata['name']])(pattern, **vdata)
    return variable


class VariableType:
    '''
    Algorithm class
    '''
    def generate(self):
        raise NotImplementedError


class FixSingleVariable(VariableType):
    name = 'fix-single'
    params = ('value', )

    def __init__(self, pattern, **kwargs):
        self.pattern = pattern
        value = kwargs.get('value', None)
        if value:
            self.__args__ = {'name': self.name, 'value': value}
        else:
            raise Exception('FixSingleVariable value is required ')

    def deconstruct(self):
        path = "polls.models.variable.FixSingleVariable"
        args = [self.pattern]
        kwargs = self.__args__
        return (path, args, kwargs)


class FixListVariable(VariableType):
    name = 'fix-list'
    params = ('values', )

    def __init__(self, pattern, **kwargs):
        self.pattern = pattern
        values = kwargs.get('values', None)
        if values and isinstance(values, list):
            self.__args__ = {'values': values, 'name': self.name}
        else:
            raise Exception('FixListVariable values, a list with at least one item, is required ')

    def deconstruct(self):
        path = "polls.models.variable.FixListVariable"
        args = [self.pattern]
        kwargs = self.__args__
        return (path, args, kwargs)


class VariableField(models.Field):
    '''
    ResponseField is a Field of responseBase.
    '''

    description = "response field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, pression, connection):
        if value is None:
            return value
        data = json.loads(value)
        return variable_base_generate(data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, VariableType):
            instance = variable_base_parser(instance)
        return json.dumps(instance)


import json
from django.db import models
from .utils import class_import

VARIABLES = {'fix': 'polls.models.variable.FixSingleVariable',
             'list': 'polls.models.variable.FixListVariable', }


def get_variable_stuctures():
    d = {}
    for k, v in VARIABLES.items():
        d[k] = class_import(v).params
    return d


def variable_base_parser(instance):
    (_, args, kwargs) = instance.deconstruct()
    data = {'name': args[0]}
    for k, v in kwargs.items():
        data[k] = v
    return data


def variable_base_generate(data):
    pattern = data.pop('name')  # name of variable
    dtype = data.pop('type')  # variable's type which contains a name
    variable = class_import(VARIABLES[dtype])(pattern, **data)
    return variable


class VariableType:
    '''
    Algorithm class
    '''

    def __init__(self, pattern, **kwargs):
        self.pattern = pattern
        self.__args__ = {'type': self.name}
        for key in self.params:
            value = kwargs.get(key, None)
            if value and isinstance(value, self.params[key]):
                self.__args__[key] = kwargs[key]
            else:
                raise Exception('{} should be {}'.format(key, self.params[key]))

    def deconstruct(self):
        path = self.path
        args = [self.pattern]
        kwargs = self.__args__
        return (path, args, kwargs)

    def generate(self):
        raise NotImplementedError


class FixSingleVariable(VariableType):
    name = 'fix'
    params = {
        'value': str
    }
    path = "polls.models.variable.FixSingleVariable"

    def generate(self):
        raise NotImplementedError


class FixListVariable(VariableType):
    name = 'list'
    params = {
        'value': list
    }
    path = "polls.models.variable.FixListVariable"
    def generate(self):
        raise NotImplementedError


class ScriptVariable(VariableType):
    name = 'script'
    params = {
        'value': str,
        'language': str,
        'ouput': list
    }
    path = "polls.models.variable.ScriptVariable"


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

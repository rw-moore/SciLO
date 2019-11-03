
import json
import requests
import random
from django.db import models
from .utils import class_import

VARIABLES = {'fix': 'polls.models.variable.FixSingleVariable',
             'list': 'polls.models.variable.FixListVariable',
             'script': 'polls.models.variable.ScriptVariable'}


def get_variable_stuctures():
    d = {}
    for k, v in VARIABLES.items():
        d[k] = class_import(v).params
    return d


def variable_base_parser(instance):
    (_, _, kwargs) = instance.deconstruct()
    return kwargs


def variable_base_generate(data):
    dtype = data.get('type')  # variable's type which contains a name
    variable = class_import(VARIABLES[dtype])(**data)
    return variable


class VariableType:
    '''
    Algorithm class
    '''

    def __init__(self, **kwargs):
        self.__args__ = {'type': self.name}
        for key in self.params:
            value = kwargs.get(key, None)
            if value and isinstance(value, self.params[key]):
                self.__args__[key] = kwargs[key]
            else:
                raise Exception('{} should be {}'.format(key, self.params[key]))

    def deconstruct(self):
        path = self.path
        args = []
        kwargs = self.__args__
        return (path, args, kwargs)

    def generate(self):
        raise NotImplementedError


class FixSingleVariable(VariableType):
    name = 'fix'
    params = {
        'name': str,
        'value': str
    }
    path = "polls.models.variable.FixSingleVariable"

    def generate(self):
        return {self.__args__['name']: self.__args__['value']}


class FixListVariable(VariableType):
    name = 'list'
    params = {
        'name': str,
        'value': list
    }
    path = "polls.models.variable.FixListVariable"

    def generate(self):
        index = random.randint(0, len(self.__args__['value'])-1)
        val = self.__args__['value'][index]
        return {self.__args__['name']: val}


class ScriptVariable(VariableType):
    name = 'script'
    params = {
        'value': str,
        'language': str,
        'name': list
    }
    path = "polls.models.variable.ScriptVariable"

    def generate(self):
        # to do different language will call different system api
        url = 'http://127.0.0.1:5000'
        data = {
            "script": self.__args__['value'],
            "results": self.__args__['name']
        }
        response = requests.post(url, data=json.dumps(data))
        if response.status_code == 200:
            return json.loads(response.text)
        else:
            raise Exception(response.text)


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

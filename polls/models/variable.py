
import random
import json
import re
# import requests
from django.db import models
from api.settings import SAGECELL_URL
from polls.script.sage_client import SageCell
from .utils import class_import

# url = 'https://sagecell.sagemath.org'
url = SAGECELL_URL

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
    # print(type(data), ',', data, ',')
    if isinstance(data, dict):
        dtype = data.get('type')  # variable's type which contains a name
        variable = class_import(VARIABLES[dtype])(**data)
        return variable
    return data


class VariableType:
    '''
    Algorithm class
    '''

    def __init__(self, **kwargs):
        self.__args__ = {'type': self.name}
        for key in self.params:
            value = kwargs.get(key, None)
            if value is not None and isinstance(value, self.params[key]):
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
        # 'name': list
    }
    path = "polls.models.variable.ScriptVariable"
    def get_code(self):
        return self.__args__['value']

    def generate(self, pre_vars, after_var, seed=None, opts={}):
        # pre_vars is fix variable
        # after_var is a list of var used in question context
        fix_vars = ""
        for k, v in pre_vars.items():
            fix_vars += '{}={}\n'.format(k, v)
        data = {
            "fix": fix_vars,
            "script": self.__args__['value'],
            # "results": self.__args__['name'],
            "results": after_var,
            "language": self.__args__['language'],
            "seed": seed,
            "latex": opts.get("latex", True)
        }
        if data["language"] == "maxima":
            data["script"] = re.sub(r'\s*/\*.*?\*/\s*\n*', '\n', data["script"])
        # print('generate_data: ',data)
        sage_cell = SageCell(url)
        code = SageCell.get_code_from_body_json(data)
        print('generate_code: ', code)
        msg = sage_cell.execute_request(code)
        # print('generate_msg: ',msg)
        results = SageCell.get_results_from_message_json(msg)
        # print('generate_results: ', results)
        results = json.loads(results)
        # print('test')
        for k, v in results.items():
            results[k] = v.replace('\n', '').replace('%', '')
            for to_replace in ['pmatrix']:
                results[k] = results[k].replace("\\ifx\\end"+to_replace+"\\undefined\\"+to_replace+"{\\else\\begin{"+to_replace+"}\\fi", "\\begin{"+to_replace+"}")
                results[k] = results[k].replace("\\ifx\\end"+to_replace+"\\undefined}\\else\\end{"+to_replace+"}\\fi", "\\end{"+to_replace+"}")
            # print(repr(results[k]))
        return results


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
        # print('fromdb', end='')
        return variable_base_generate(data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, VariableType):
            instance = variable_base_parser(instance)
        return json.dumps(instance)

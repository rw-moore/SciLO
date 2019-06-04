# import json
# from django.db import models



# class VariableType:
#     '''
#     Algorithm class
#     '''

#     def generate(self):
#         raise NotImplementedError


# class FixVariable(VariableType):
#     name = 'fix'
#     params = ('value', 'precision_value', )

#     def __init__(self, **kwargs):
#         self.__args__ = {
#             'precision_type': None,
#             'precision_value': None}
#         for k, v in kwargs.items():
#             if k in self.__params__:
#                 self.__args__[k] = v

#     def deconstruct(self):
#         path = "polls.models.variable.FixVariable"
#         args = []
#         kwargs = self.__args__
#         return (path, args, kwargs)



# class VariableField(models.Field):
#     '''
#     ResponseField is a Field of responseBase.
#     '''

#     description = "response field"

#     def __init__(self, **kwargs):
#         super().__init__(**kwargs)

#     def db_type(self, connection):
#         return 'TEXT'

#     def from_db_value(self, value, pression, connection):
#         if value is None:
#             return value
#         data = json.loads(value)
#         return variable_base_generate(data)

#     def get_prep_value(self, value):
#         instance = value
#         if isinstance(value, VariableType):
#             instance = variable_base_parser(instance)
#         return json.dumps(instance)

#     def deconstruct(self):
#         name, path, args, kwargs = super().deconstruct()
#         return name, path, args, kwargs






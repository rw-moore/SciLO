from django.db import models
import json

class GradePolicy(object):
    POLICY_CHOICES = [
        'max',
        'min',
        'average',
        'recent',
    ]
    penalty_type = ['float', 'int']

    def __init__(self, max_tries, penalty_per_try, policy, penalty_type):
        if policy in self.POLICY_CHOICES and penalty_type in penalty_type:
            self.max_tries = int(max_tries)
            self.policy = policy
            self.penalty_type = penalty_type
            if self.penalty_type == penalty_type[0]:
                self.penalty_per_try = float(penalty_per_try)
            else:
                self.penalty_per_try = int(penalty_per_try)

        else:
            raise Exception("init error")

    def grade_policy_base_parser(self):
        d = {
            'penalty_type': self.penalty_type,
            'max_tries': self.max_tries,
            'policy': self.policy,
            'POLICY_CHOICES': self.POLICY_CHOICES,
        }
        return d

    def deconstruct(self):
        path = "polls.models.gradepolicy.GradePolicy"
        args = [self.max_tries, self.penalty_per_try, self.policy, self.penalty_type]
        kwargs = {}

        return (path, args, kwargs)


class GradePolicyField(models.Field):
    description = "grade policy field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, pression, connection):
        if value is None:
            return value
        data = json.loads(value)
        return GradePolicy(data['max_tries'], data['penalty_per_try'], data['policy'], data['penalty_type'])

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, GradePolicy):
            instance = value.grade_policy_base_parser()
        return json.dumps(instance)

    def deconstruct(self):

        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs

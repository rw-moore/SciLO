import json
from django.db import models


class GradePolicy:
    POLICY_CHOICES_MAP = [
        'max',
        'min',
        'average',
        'recent',
    ]

    def __init__(self, max_tries, free_tries=0, penalty_per_try=0, policy='max', **kwargs):
        if policy in self.POLICY_CHOICES_MAP:
            self.max_tries = int(max_tries)
            self.free_tries = int(free_tries)
            self.policy = policy
            self.penalty_per_try = float(penalty_per_try)
        else:
            raise Exception("init error")

    def grade_policy_base_parser(self):
        d = {
            'penalty_per_try': self.penalty_per_try,
            'max_tries': self.max_tries,
            'free_tries': self.free_tries,
            'policy': self.policy
        }
        return d

    def deconstruct(self):
        path = "polls.models.gradepolicy.GradePolicy"
        args = [self.max_tries, self.free_tries, self.penalty_per_try, self.policy]
        kwargs = {}

        return (path, args, kwargs)


class GradePolicyField(models.Field):
    description = "grade policy field"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, pression, connection):  # pylint:disable=unused-argument
        if value is None:
            return value
        data = json.loads(value)
        return GradePolicy(data.pop('max_tries'), **data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, GradePolicy):
            instance = value.grade_policy_base_parser()
        return json.dumps(instance)

    def deconstruct(self):

        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs

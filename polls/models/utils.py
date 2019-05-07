from django.db import models


class MinMaxFloat(models.FloatField):
    '''
    from https://stackoverflow.com/questions/10539026/
    '''

    def __init__(self, min_value, max_value, *args, **kwargs):
        self.min_value, self.max_value = float(min_value), float(max_value)
        if self.min_value > self.max_value:
            raise ValueError("min value {} bigger than max value {}"
                             .format(self.min_value, self.max_value))

        super(MinMaxFloat, self).__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'min_value': self.min_value,
                    'max_value': self.max_value}
        defaults.update(kwargs)
        return super(MinMaxFloat, self).formfield(**defaults)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        args = [self.min_value, self.max_value] + args
        return name, path, args, kwargs

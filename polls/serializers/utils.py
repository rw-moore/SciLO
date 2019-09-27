class FieldMixin:
    # https://stackoverflow.com/questions/47119879/how-to-get-specific-field-from-serializer-of-django-rest-framework
    def get_field_names(self, *args, **kwargs):
        return_fields = []
        fields = super(FieldMixin, self).get_field_names(*args, **kwargs)

        field_names = self.context.get('fields', None)
        if field_names:
            for field in field_names:
                if field in fields:
                    return_fields.append(field)
            return return_fields

        field_names = self.context.get('exclude_fields', None)
        if field_names:
            for field in fields:
                if field not in field_names:
                    return_fields.append(field)
            return return_fields

        return fields

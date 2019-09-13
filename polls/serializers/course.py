from rest_framework import serializers
from polls.models import Course
from .user import GroupSerializer
from .utils import FieldMixin


class CourseSerializer(FieldMixin, serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = (
            'id',
            'fullname',
            'shortname',
            'groups'
        )

    def to_representation(self, obj):
        obj_dict = super().to_representation(obj)
        if self.context.get('groups_context', None):
            serilaizer = GroupSerializer(obj.groups.all(), many=True, context=self.context['groups_context'])
            obj_dict['groups'] = serilaizer.data
        return obj_dict

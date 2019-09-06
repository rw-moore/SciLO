from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions
from django.shortcuts import get_object_or_404
from polls.models import Group, User
from polls.serializers import GroupSerializer


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def add_user_to_group(request, pk):
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message":'required filed: users'})
    group = get_object_or_404(Group, pk=pk)
    users = [get_object_or_404(User, pk=uid) for uid in uids]
    group.user_set.set(users)
    group.save()
    serializer = GroupSerializer(group)
    return  HttpResponse(status=200, data=serializer.data)


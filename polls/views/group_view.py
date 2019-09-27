from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions
from django.shortcuts import get_object_or_404
from polls.models import Group, User
from polls.serializers import GroupSerializer


@api_view(['POST', 'DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def add_delete_users_to_group(request, pk):
    uids = request.data.get('users', None)
    if uids is None:
        return HttpResponse(status=400, data={"message": 'required filed: users'})
    group = get_object_or_404(Group, pk=pk)
    users = User.objects.filter(pk__in=uids)  # get all users via uids

    if request.method == 'POST':
        group.user_set.add(*users)
    elif request.method == 'DELETE':
        group.user_set.remove(*users)
    group.save()
    serializer = GroupSerializer(group, context={"fields": ["id", "name", "users"], "users_context": {
        "fields": ['id', 'username', 'first_name', 'last_name', 'email']}})
    return HttpResponse(status=200, data=serializer.data)


@api_view(['DELETE'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAdminUser])
def delete_group(request, pk):
    group = get_object_or_404(Group, pk=pk)
    group.delete()
    return HttpResponse(status=200)

from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response as HTTP_Response
<<<<<<< HEAD
from rest_framework.permissions import IsAdminUser
=======
from rest_framework.permissions import IsAuthenticated, IsAdminUser
>>>>>>> c413bca6917627cf6a32e2706a68c0c9f838ea16
from polls.serializers import TagSerializer, QuestionSerializer
from polls.models import Tag
from polls.permissions import IsInstructorOrAdmin


class TagViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def create(self, request):
        '''
        POST /tags/
        '''
        if self.queryset.filter(name=request.data['name']).exists():
            return HTTP_Response({'status': 'unsuccess', 'errors': 'tag with this name already exists.'}, 400)
        response = super().create(request)
        return HTTP_Response({'tags': response.data, 'status': 'success'}, 200)

    def list(self, request):
        '''
        GET /tags/
        '''
        qset = Tag.objects.with_active()
        serializer = TagSerializer(qset, many=True)
        return HTTP_Response({'tags': serializer.data, 'length': len(serializer.data), 'status': 'success'}, 200)

    def get_questions_with_given_tag(self, request, pk=None):
        '''
        GET /tags/{pk}/questions
        '''
        tag = get_object_or_404(self.queryset, pk=pk)
        data = tag.question_set.all()
        seralizer = QuestionSerializer(data, many=True)
        return HTTP_Response({
            'status': 'success',
            'length': len(seralizer.data),
            'questions': seralizer.data}, 200)

    def partial_update(self, request, pk=None):
        '''
        patch /tag/{pk}
        '''
        tag = get_object_or_404(self.queryset, pk=pk)
        serializer = TagSerializer(tag, request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return HTTP_Response({'status': 'success'}, 200)
        else:
            return HTTP_Response({'status': 'unsuccess', 'errors': serializer.errors}, 400)

    def destroy(self, request, pk=None):
        '''
        DELETE /userprofile/{id}
        '''
        Tag.objects.get(pk=pk).delete()
        return HTTP_Response({'status': 'success'}, 200)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
<<<<<<< HEAD
            permission_classes = [IsInstructorOrAdmin]
=======
            permission_classes = [IsAuthenticated]
>>>>>>> c413bca6917627cf6a32e2706a68c0c9f838ea16
        return [permission() for permission in permission_classes]

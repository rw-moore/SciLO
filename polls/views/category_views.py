from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import (
    action,
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from polls.serializers import *
from polls.models import QuizCategory, QuestionCategory


class QuizCategoryViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = QuizCategory.objects.all()
    serializer_class = QuizCategorySerializer

    @action(detail=True, methods=['get', 'post'])
    def quizcategory(self, request):
        '''
        POST /quiz-category/
        '''
        if request.method == 'POST':
            serializer = QuizCategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {'status': 'success', 'category': serializer.data})
            else:
                return Response(
                    {'status': 'false', 'errors': serializer.errors})
        elif request.method == 'GET':
            queryset = QuizCategory.objects.all()
            serializer = QuizCategorySerializer(queryset, many=True)
            return Response(
                {'status': 'success', 'categories': serializer.data})
        else:
            return

    @action(detail=True, methods=['delete'])
    def destroy(self, request, pk=None):
        '''
        DELETE /quiz-category/{id}/
        '''
        QuizCategory.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def retrieve(self, request, pk=None):
        '''
        GET /quiz-category/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'category': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /quiz-category/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'category': response.data}
        return response

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'quizcategory':
            permission_classes = [IsAdminUser]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class QuestionCategoryViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = QuestionCategory.objects.all()
    serializer_class = QuestionCategorySerializer

    @action(detail=True, methods=['get', 'post'])
    def questioncategory(self, request):
        '''
        POST /question-category/
        '''
        if request.method == 'POST':
            serializer = QuestionCategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'status': 'success', 'category': serializer.data})
            else:
                return Response({'status': 'false', 'errors': serializer.errors})
        elif request.method == 'GET':
            queryset = QuestionCategory.objects.all()
            serializer = QuestionCategorySerializer(queryset, many=True)
            return Response(
                {'status': 'success', 'categories': serializer.data})
        else:
            return

    @action(detail=True, methods=['delete'])
    def destroy(self, request, pk=None):
        '''
        DELETE /question-category/{id}/
        '''
        QuestionCategory.objects.get(pk=pk).delete()
        return Response({'status': 'success'})

    def retrieve(self, request, pk=None):
        '''
        GET /question-category/{id}/
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'category': response.data}
        return response

    def partial_update(self, request, pk=None):
        '''
        POST /question-category/{id}/
        '''
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'category': response.data}
        return response

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'questioncategory':
            permission_classes = [IsAdminUser]
        elif self.action == 'destroy':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


@api_view(["GET"])
@permission_classes((IsAuthenticated, AllowAny))
def getcategories(request):
    '''
    GET /category/
    '''
    quiz_queryset = QuizCategory.objects.all()
    quiz_serializer = QuizCategorySerializer(quiz_queryset, many=True)
    question_queryset = QuestionCategory.objects.all()
    question_serializer = QuestionCategorySerializer(
        question_queryset, many=True)
    data = quiz_serializer.data + question_serializer.data
    return Response({'status': 'success', 'categories': data})

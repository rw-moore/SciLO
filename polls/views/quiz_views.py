from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response as HttpResponse
from rest_framework import authentication, permissions
from django.shortcuts import get_object_or_404
from polls.models import  Quiz
from polls.serializers import QuizSerializer


@api_view(['GET','POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_or_quiz_by_couse_id(request, pk):
    '''
    permission: admin/in course's group
    if method is GET => return quizzes in such course
    if method is POST => create a quiz in such course
    '''
    return

@api_view(['PUT'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_quiz_by_id(request, pk):
    '''
    permission: admin/instuctor
    modify quiz if only if it does not have quiz-attempt
    '''
    return

@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def copy_questions_to_course(request, pk):
    '''
    permission: instructor in course's group
    copy and paste questions to course
    '''
    return


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def copy_questions_from_course(request, pk):
    '''
    permission: instructor in course's group
    copy and paste questions from course to self
    '''
    return

@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_all_quiz(request, pk):
    '''
    permission: login
    if admin return all quizzes
    else return quizzes they can access
    '''
    return





from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import authentication, permissions
from django.shortcuts import get_object_or_404
from polls.models import Attempt, Quiz


def left_tries(tries):
    answered_count = 0
    for one_try in tries:
        if one_try[0] is not None:
            answered_count += 1
        else:
            return len(tries)-answered_count
    return 0


def serilizer_quiz_attempt(attempt, context=None):
    from polls.serializers import QuizSerializer
    if isinstance(attempt, Attempt):
        attempt_data = {"id": attempt.id}
        if context is None:
            context = {
                'author_detail': False,
                'question_context': {
                    'author_detail': False,
                    'fields': ['id', 'text', 'title', 'variables', 'tags'],
                    'response_context': {
                        'fields': ['id', 'index', 'text', 'mark', 'rtype'],
                        "algorithm_detail": False,
                        'answer_detail': False
                    }
                }
            }
        else:
            context = {}
        serializer = QuizSerializer(attempt.quiz, context=context)
        attempt_data['quiz'] = serializer.data
        attempt_data['quiz']['mark'] = attempt.quiz_attempts['mark']
        attempt_data['quiz']['grade'] = attempt.quiz_attempts['grade']
        for question in attempt_data['quiz']['questions']:
            for addon_question in attempt.quiz_attempts['questions']:
                if question['id'] == addon_question['id']:
                    question['grade'] = addon_question['grade']
                    for response in question['responses']:
                        for addon_response in addon_question['responses']:
                            if response['id'] == addon_response['id']:
                                response['tries'] = addon_response['tries']
                                response['left_tries'] = left_tries(response['tries'])
        return attempt_data
    else:
        raise Exception('attempt is not Attempt')


@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_quiz_attempt_by_id(request, pk):
    attempt = get_object_or_404(Attempt, pk=pk)
    data = serilizer_quiz_attempt(attempt)
    return Response(data)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def create_quiz_attempt_by_quiz_id(request, pk):
    student = request.user
    quiz = get_object_or_404(Quiz, pk=pk)
    attempt = Attempt.objects.create(student=student, quiz=quiz)
    data = serilizer_quiz_attempt(attempt)

    return Response(data)

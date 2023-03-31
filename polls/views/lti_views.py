from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from lti import ToolConfig
from lti.contrib.django import DjangoToolProvider
from rest_framework import authentication
from rest_framework import permissions  # , viewsets
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response
from rest_framework.views import APIView

from polls.models import UserProfile, LTISecret, Quiz, QuizLTI
from polls.validator import LTIRequestValidator
from polls.permissions import GetQuizSecrets
from secrets import token_hex


def tool_config(request):

    # basic stuff
    app_title = 'SciLo'
    app_description = 'An example LTI App'
    launch_url = "http://localhost:3000"

    # maybe you've got some extensions
    extensions = {
        'my_extensions_provider': {
            # extension settings...
        }
    }

    lti_tool_config = ToolConfig(
        title=app_title,
        launch_url=launch_url,
        secure_launch_url=launch_url,
        extensions=extensions,
        description = app_description
    )

    return HttpResponse(lti_tool_config.to_xml(), content_type='text/xml')

class LTIView(APIView):
    authentication_classes = []
    permission_classes = []
    queryset = UserProfile.objects.none()

    def post(self, request, quiz_id, *args, **kwargs):
        print('lti post')
        print(request)
        print(request.data)
        if request.data.get('lti_version', None) == 'LTI-1p0':
            email = request.data.get('lis_person_contact_email_primary', '')
            return_url = request.data.get('lis_outcome_service_url', '')
            sourcedid = request.data.get('lis_result_sourcedid', '')
            # timestamp = request.data.get('', '')
            # from_django_request errors out if this key is present
            request.POST._mutable = True
            for_user_id = request.POST.pop('for_user_id', None)
            request.POST._mutable = False

            # create the tool provider instance
            tool_provider = DjangoToolProvider.from_django_request(request=request)

            # the tool provider uses the 'oauthlib' library which requires an instance
            # of a validator class when doing the oauth request signature checking.
            # see https://oauthlib.readthedocs.org/en/latest/oauth1/validator.html for
            # info on how to create one
            validator = LTIRequestValidator()

            # validate the oauth request signature
            ok = tool_provider.is_valid_request(validator)
            print(ok)
            print(request.build_absolute_uri())
            # if user already had an entry for this quiz, update timestamp
            if QuizLTI.objects.filter(quiz__id=quiz_id, email=email).exists():
                pass
            else:
                quiz = get_object_or_404(Quiz, pk=quiz_id)
                QuizLTI.objects.create(
                    quiz=quiz,
                    email=email,
                    sourcedid=sourcedid,
                    returnurl=return_url,
                    # timestamp=timestamp
                )

            # do stuff if ok / not ok
            return HttpResponseRedirect(redirect_to=f"https://equiz.math.ualberta.ca/Quiz/{quiz_id}/new")
        elif request.data.get('lti_version', None) == 'LTI-1p3':
            return HttpResponse(status=404)

@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([GetQuizSecrets])
def get_quiz_secrets(request, quiz_id):
    quiz = get_object_or_404(Quiz, pk=quiz_id)
    secrets = None
    if LTISecret.objects.filter(quiz=quiz).exists():
        secrets = get_object_or_404(LTISecret, quiz=quiz)
    else:
        consumer_key = token_hex(32)
        while LTISecret.objects.filter(consumer_key=consumer_key).exists():
            consumer_key = token_hex(32)
        shared_secret = token_hex(32)
        secrets = LTISecret.objects.create(quiz=quiz, consumer_key=consumer_key, shared_secret=shared_secret)
        secrets.save()
    return Response(status=200, data={'consumer_key': secrets.consumer_key, 'shared_secret': secrets.shared_secret})


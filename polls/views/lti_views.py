from lti import ToolConfig
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework import permissions #, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from lti.contrib.django import DjangoToolProvider
from polls.models import UserProfile
from polls.validator import LTIRequestValidator

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
        print(request.headers.items())
        email = request.data.get('lis_person_contact_email_primary', '')
        print(email)
        request.session['lti_email'] = email
        request.session['lti_return_address'] = request.data.get('lis_outcome_service_url', '')

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

        # do stuff if ok / not ok
        return HttpResponseRedirect(redirect_to=f"https://equiz.math.ualberta.ca/Quiz/{quiz_id}/new")

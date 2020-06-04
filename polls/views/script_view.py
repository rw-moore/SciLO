# from django.shortcuts import get_object_or_404
from rest_framework import permissions #, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from polls.serializers import TagSerializer, QuestionSerializer
from polls.models import UserProfile #, Tag
# from polls.permissions import IsInstructorOrAdmin
# import polls.script.sage_client
from polls.script.sage_client import SageCell

class ScriptView(APIView):
    permissions_classes = [
        permissions.AllowAny
    ]
    queryset = UserProfile.objects.none()

    def post(self, request, *args, **kwargs):
        url = 'https://sagecell.sagemath.org'
        url = request.data.get("url", url)
        code = request.data.get("code", None)
        seed = request.data.get("seed", None)
        language = request.data.get("language", "sage")

        if not code:
            return Response("No code was given", status=400)

        if language == "maxima":
            if seed:
                pre = "_seed: {}$s1: make_random_state (_seed)$set_random_state (s1)$".format(seed)
            code = "print(maxima.eval('{}'))".format(pre+code)

        elif language == "python":
            code = "print(eval('{}'))".format(code)

        pre = "_seed={}\nimport random\nrandom.seed(_seed)\n".format(seed)
        sage = SageCell(url)
        msg = sage.execute_request(pre+code)

        try:
            results = SageCell.get_results_from_message_json(msg)
        except ValueError as e:
            return Response(e.args, status=400)
        return Response(results)

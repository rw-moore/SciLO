
import copy
import random, time
# from django.shortcuts import get_object_or_404
from rest_framework import permissions #, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from polls.serializers import TagSerializer, QuestionSerializer
from polls.models import UserProfile #, Tag
# from polls.permissions import IsInstructorOrAdmin
# import polls.script.sage_client
from polls.models.algorithm import DecisionTreeAlgorithm
from polls.models.variable import variable_base_generate
from polls.views.attempt_view import substitute_question_text

'''  # sample tree data

'''

class TreeView(APIView):
    permissions_classes = [
        permissions.AllowAny
    ]
    queryset = UserProfile.objects.none()

    def post(self, request, *args, **kwargs):
        start = time.time()
        # print(request.data)
        ReqInput = request.data.get("input", {})
        other_args = request.data.get("args", {})
        tree = request.data.get("tree", {})
        other_args["full"] = request.data.get("full", False)
        seed = other_args.get("seed", random.randint(1, 10001))
        script = copy.deepcopy(other_args["script"])
        try:
            result, feedback = DecisionTreeAlgorithm().execute(tree, ReqInput, other_args)
            middle = time.time()
            question = {
                "feedback": feedback,
                'variables': {},
                'responses': []
            }
            script = variable_base_generate(script)
            question = substitute_question_text(question, script, seed)
            end = time.time()
            return Response({
                "score": result["score"], 
                "feedback": feedback, 
                "trace": result, 
                "time": "processing time: {:.2f}s, collecting feedback: {:.2f}s, total: {:.2f}s".format(middle-start, end-middle, end-start)
            })
        except ValueError as e:
            #raise e
            return Response(e.args, status=400)

    def check_permissions(self, request):
        # print(request.user)
        # print(request.headers)
        # TO DO why does using super().check_permissions(request) fail
        return True

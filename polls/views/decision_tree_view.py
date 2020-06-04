
import time
# from django.shortcuts import get_object_or_404
from rest_framework import permissions #, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from polls.serializers import TagSerializer, QuestionSerializer
from polls.models import UserProfile #, Tag
# from polls.permissions import IsInstructorOrAdmin
# import polls.script.sage_client
from polls.models.algorithm import get_feedback, process_node

'''  # sample tree data
    {
        "input": "10",
        "tree": {
            "title": "root",
            "type": -1,
            "policy": "max",
            "children": [
                {
                    "title": "-50 for everyone",
                    "bool": true,
                    "type": 0,
                    "score": -50,
                    "feedback": "you lost 50 marks."
                },
                {
                    "title": "50 for everyone",
                    "bool": true,
                    "type": 0,
                    "score": 50,
                    "feedback": "you earned 50 marks."
                },
                {
                    "title": "_value > 5",
                    "label": "is my number > 5",
                    "bool": true,
                    "type": 1,
                    "feedback": {
                        "true": "your number is > 5",
                        "false": "your number is not > 5"
                    },
                    "children": [
                        {
                            "title": "50 score if my number > 5",
                            "feedback": "you get 50 if your number > 5",
                            "bool": true,
                            "type": 0,
                            "score": 50
                        },
                        {
                            "title": "_value > 10",
                            "label": "is my number > 10",
                            "bool": true,
                            "type": 1,
                            "feedback": {
                                "true": "your number is > 10",
                                "false": "your number is not > 10"
                            },
                            "children": [
                                {
                                    "title": "50 score if my number > 10",
                                    "bool": true,
                                    "type": 0,
                                    "score": 50
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
'''

class TreeView(APIView):
    permissions_classes = [
        permissions.AllowAny
    ]
    queryset = UserProfile.objects.none()

    def post(self, request, *args, **kwargs):
        start = time.time()
        ReqInput = request.data.get("input", "")
        other_args = request.data.get("args", {})
        tree = request.data.get("tree", {})
        full = request.data.get("full", False)

        try:
            result = process_node(tree, ReqInput, other_args)
            middle = time.time()
            feedback = get_feedback(result, full)
            end = time.time()
            return Response({"score": result["score"], "feedback": feedback, "trace": result, "time": "processing time: {:.2f}s, collecting feedback: {:.2f}s, total: {:.2f}s".format(middle-start, end-middle, end-start)})
        except ValueError as e:
            #raise e
            return Response(e.args, status=400)

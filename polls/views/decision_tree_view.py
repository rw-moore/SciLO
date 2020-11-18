
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
        mults = request.data.get('mult', {})
        tree = request.data.get("tree", {})
        full = request.data.get("full", False)
        try:
            result = process_node(tree, ReqInput, other_args, mults)
            middle = time.time()
            feedback = get_feedback(result, full)
            end = time.time()
            return Response({"score": result["score"], "feedback": feedback, "trace": result, "time": "processing time: {:.2f}s, collecting feedback: {:.2f}s, total: {:.2f}s".format(middle-start, end-middle, end-start)})
        except ValueError as e:
            #raise e
            return Response(e.args, status=400)

    def check_permissions(self, request):
        # print(request.user)
        # print(request.headers)
        # TO DO why does using super().check_permissions(request) fail
        return True

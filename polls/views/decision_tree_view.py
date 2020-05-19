
import time
# from django.shortcuts import get_object_or_404
from rest_framework import permissions #, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from polls.serializers import TagSerializer, QuestionSerializer
from polls.models import User #, Tag
# from polls.permissions import IsInstructorOrAdmin
# import polls.script.sage_client
from polls.script.sage_client import SageCell
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

class Node():
    def __init__(self, node, NodeInput, args=None):
        self.node = node
        self.input = NodeInput
        self.args = args

    def decide(self, node):
        assert node.get("type", 0) != 0  # don't decide a score node.

        url = 'https://sagecell.sagemath.org'
        code = node["title"]
        code = code.replace("_value", self.input)  #
        seed = self.args.get("seed", None)
        script = self.args.get("script", "").replace("_value", self.input)
        language = self.args.get("language", "sage")

        if language == "maxima":
            if seed:
                pre = "_seed: {}$s1: make_random_state (_seed)$set_random_state (s1)$ ".format(seed)
            code = "print(maxima.eval('{}'))".format(pre+script+" "+code)

        else:
            code = script+"\n"+code

        pre = "_seed={}\nimport random\nrandom.seed(_seed)\n".format(seed)
        sage = SageCell(url)
        msg = sage.execute_request(pre+code)
        try:
            results = SageCell.get_results_from_message_json(msg)
            if results == "True":
                return True
            elif results == "False":
                return False
            else:
                raise ValueError('unexpected outcome from execution')
        except ValueError as e:
            raise e

    def get_result(self, trace=False):
        if not self.node:  # handle some invalid cases
            return 0, None
        else:
            self.node["state"] = 1  # visit node

        if self.node["type"] == 0:  # we just need to return the score if it is a score node
            return self.node
        else:  # we need to process the decision first then go through its valid children.
            # isRoot = False
            children = self.node.get("children", [])
            if self.node["type"] != -1:  # we don't decide root
                myBool = self.decide(self.node)  # get condition
                self.node["eval"] = myBool
                bool_str = "true" if myBool else "false"
                # decide feedback
                feedback = self.node.get("feedback")
                if feedback:
                    feedback = feedback.get(bool_str)
                    if feedback:
                        self.node["feedback"] = feedback

                # filter children
                children = list(filter(lambda c: c['bool'] == myBool, children))
                policy = self.node.get("policy")
                policy = policy.get(bool_str, "sum") if policy else "sum"
            else:
                # isRoot = True
                policy = self.node.get("policy", "sum")
            # recursively get result from children, THIS CAN BE INPROVED BY BRANCH CUTTING
            results = list(map(lambda c: process_node(c, self.input, self.args), children))
            scores = list(map(lambda r: r["score"], results))

            # based on the policy, get the score and return

            if policy == "sum":
                score = sum(scores)
                self.node["score"] = score
                for child in children:
                    child["state"] = 2  # visited and used
                return self.node

            elif policy == "max":
                score = max(scores)
                self.node["score"] = score
                index = scores.index(score)
                children[index]["state"] = 2
                return self.node

            elif policy == "min":
                print(scores)
                score = min(scores)
                self.node["score"] = score
                index = scores.index(score)
                children[index]["state"] = 2
                return self.node

def get_feedback(result, full=False):
    state = result.get("state")
    if not state:
        return

    feedbacks = []
    current = result.get("feedback")
    if current:
        feedbacks.append(current)

    if result["type"] == 0:
        return feedbacks
    else:
        children = result.get("children")
        if children:
            for child in children:
                if child.get("state") == 2 or full:
                    feedback = get_feedback(child, full)
                    if feedback:
                        feedbacks += feedback
        return feedbacks


# We can use multiple threads to get the result
def process_node(node, ProcInput, args):
    return Node(node, ProcInput, args).get_result()

class TreeView(APIView):
    permissions_classes = [
        permissions.AllowAny
    ]
    queryset = User.objects.none()

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

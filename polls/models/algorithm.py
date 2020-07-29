import hashlib
import json
import subprocess
from django.db import models
from api.settings import SAGECELL_URL
from .utils import class_import
from ..script.sage_client import SageCell


def algorithm_base_generate(atype, **kwargs):
    ALGORITHMS = {'numerical': 'polls.models.algorithm.NumericalComparisonAlgorithm',
                  'string': 'polls.models.algorithm.StringComparisonAlgorithm',
                  'tree': 'polls.models.algorithm.DecisionTreeAlgorithm'
                  }
    algorithm = class_import(ALGORITHMS[atype])(**kwargs)
    return algorithm


def algorithm_base_parser(instance):
    (_, aytpe, data) = instance.deconstruct()
    data['name'] = aytpe[0]
    return data


class Algorithm:
    '''
    Algorithm class
    '''

    def run(self):
        raise NotImplementedError

    def execute(self):
        raise NotImplementedError

    def deconstruct(self):
        raise NotImplementedError


# not used
class NumericalComparisonAlgorithm(Algorithm):

    name = 'numerical'
    params = ('precision_type', 'precision_value', )

    def __init__(self, **kwargs):
        self.__args__ = {
            'precision_type': None,
            'precision_value': None}
        for k, v in kwargs.items():
            if k in self.params:
                self.__args__[k] = v

    def deconstruct(self):
        path = 'polls.models.algorithm.NumericalComparisonAlgorithm'
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''

        student_answer_string = json.dumps(student_answer)
        answers_string = json.dumps(answers)
        args = json.dumps(self.__args__)
        result = subprocess.run(
            ['sage', 'polls/script/numerical.py',
             student_answer_string, answers_string, args
             ],
            capture_output=True
        )
        return json.loads(result.stdout)


# seed: attempt id as salt
class MutipleChioceComparisonAlgorithm(Algorithm):
    name = 'mc'
    params = ('ignore_case', )

    def __init__(self, **kwargs):
        self.__args__ = {'ignore_case': False}
        for k, v in kwargs.items():
            if k in self.params:
                self.__args__[k] = v

    def deconstruct(self):
        path = 'polls.models.algorithm.StringComparisonAlgorithm'
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)

    def hash_text(self, text, seed):
        salt = str(seed)
        return hashlib.sha256(salt.encode() + text.encode()).hexdigest()

    def run(self, student_answer, answers, seed):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''
        matched_answer = []
        student_answer_value = student_answer

        # multiple choices
        if isinstance(student_answer_value, list):
            return [answer for answer in answers if self.hash_text(answer['text'], seed) in student_answer_value]

        for answer in answers:
            if self.hash_text(answer['text'], seed) == student_answer_value:
                matched_answer.append(answer)
                break
        return matched_answer

    def execute(self, student_answer, answers, seed, matched_answers=None):
        grade = 0
        feedback = []
        if matched_answers and isinstance(matched_answers, list):
            print(123)
        else:
            matched_answers = self.run(student_answer, answers, seed)
        for answer in matched_answers:
            grade += answer['grade']
            feedback.append(answer['comment'])
        return grade, feedback


# not used
class MathExpressionComparisonAlgorithm(Algorithm):
    name = 'math_express'
    params = ('exclude')

    def __init__(self, **kwargs):
        self.__args__ = {'exclude': None}
        for k, v in kwargs.items():
            if k in self.params:
                self.__args__[k] = v

    def deconstruct(self):
        path = 'polls.models.algorithm.MathExpressionComparisonAlgorithm'
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''

        student_answer_string = json.dumps(student_answer)
        answers_string = json.dumps(answers)
        args = json.dumps(self.__args__)
        result = subprocess.run(
            ['sage', 'polls/script/mathexpress.py',
             student_answer_string, answers_string, args
             ],
            capture_output=True
        )
        return json.loads(result.stdout)


class StringComparisonAlgorithm(Algorithm):

    name = 'string'
    params = ('ignore_case', )

    def __init__(self, **kwargs):
        self.__args__ = {'ignore_case': False}
        for k, v in kwargs.items():
            if k in self.params:
                self.__args__[k] = v

    def deconstruct(self):
        path = 'polls.models.algorithm.StringComparisonAlgorithm'
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, student_answer, answers):
        '''
        student_answer: {} which is ResponseAttempt json
        answers: [{}] which is list of Answer json
        '''
        matched_answer = []
        ignore_case = self.__args__.get('ignore_case', False)
        student_answer_value = student_answer

        # multiple choices
        if isinstance(student_answer_value, list):
            return [answer for answer in answers if answer['text'] in student_answer_value]

        for answer in answers:
            if ignore_case:
                if answer['text'].lower() == student_answer_value.lower():
                    matched_answer.append(answer)
                    break
            else:
                if answer['text'] == student_answer_value:
                    matched_answer.append(answer)
                    break
        return matched_answer

    def execute(self, student_answer, answers, matched_answers=None):
        grade = 0
        feedback = []
        if matched_answers and isinstance(matched_answers, list):
            print(123)
        else:
            matched_answers = self.run(student_answer, answers)
        for answer in matched_answers:
            grade += answer['grade']
            feedback.append(answer['comment'])
        return grade, feedback


class AlgorithmField(models.Field):
    '''
    AlgorithmField will generate algorithm (Algorithm)by given
    algorithm's type and other args
    '''

    description = 'Algorithm field'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def db_type(self, connection):
        return 'TEXT'

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        data = json.loads(value)
        atype = data.pop('name')
        return algorithm_base_generate(atype, **data)

    def get_prep_value(self, value):
        instance = value
        if isinstance(value, Algorithm):
            instance = algorithm_base_parser(instance)
        return json.dumps(instance)


# Decision tree algorithm
class DecisionTreeAlgorithm(Algorithm):

    name = 'tree'
    params = ('ignore_case', )

    def __init__(self, **kwargs):
        self.__args__ = {'ignore_case': False}
        for k, v in kwargs.items():
            if k in self.params:
                self.__args__[k] = v

    def deconstruct(self):
        path = 'polls.models.algorithm.DecisionTreeAlgorithm'
        args = [self.name]
        kwargs = self.__args__
        return (path, args, kwargs)

    def run(self, tree, answer, args=None):
        '''
        answer: student answer,
        tree: decision tree
        return: result of processing tree
        '''
        return process_node(tree, answer, args)

    def execute(self, tree, answer, args=None):
        full = args["full"] if args["full"] else False
        result = self.run(tree, answer, args)
        score = result["score"]
        feedback = get_feedback(result, full)
        return score, feedback


class Node:
    def __init__(self, node, NodeInput, args=None):
        self.node = node
        self.input = NodeInput
        self.args = args

    def decide(self, node):
        assert node.get("type", 0) != 0  # don't decide a score node.

        # url = 'https://sagecell.sagemath.org'
        url = SAGECELL_URL
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

    def get_result(self):
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

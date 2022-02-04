import hashlib
import json
import subprocess
import re
import copy
import ast
from django.db import models
from api.settings import SAGECELL_URL
from .utils import class_import
from ..script.sage_client import SageCell, code_convert

class str2(str):
    def __repr__(self) -> str:
        return ''.join(('"', super().__repr__()[1:-1], '"'))

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
class MultipleChoiceComparisonAlgorithm(Algorithm):
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
                matched_answer = answer
                break
        return matched_answer

    def execute(self, student_answer, answers, seed, matched_answers=None):
        grade = 0
        feedback = []
        if matched_answers and isinstance(matched_answers, list):
            print(123)
        else:
            matched_answers = self.run(student_answer, answers, seed)
        if isinstance(matched_answers, list):
            for answer in matched_answers:
                grade += float(answer['grade'])
                if 'comment' in answer and answer['comment'] is not None:
                    feedback.append(answer['comment'])
        else:
            grade = float(matched_answers["grade"])
            if "comment" in matched_answers and matched_answers["comment"] is not None:
                feedback.append(matched_answers["comment"])
        return grade, feedback

    def get_identifier(self, student_answer, answers):
        for answer in answers:
            if student_answer == answer["text"]:
                return answer["identifier"] if "identifier" in answer and answer["identifier"] else answer["text"]

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

    def run(self, tree, answer, args=None, mults=None):
        '''
        answer: student answer,
        tree: decision tree
        return: result of processing tree
        '''
        return evaluate_tree(tree, answer, args, mults)

    def execute(self, tree, answer, args=None, mults=None):
        full = args["full"] if args["full"] else False
        result = self.run(tree, answer, args, mults)
        score = result["score"]
        output = {"end":[]}
        get_feedback(result, output, full)
        return score, output


class Node:
    def __init__(self, node, NodeInput, args=None, results=None):
        self.node = node
        self.input = NodeInput
        self.args = args
        self.results = results

    def get_result(self):
        if not self.node:  # handle some invalid cases
            return 0, None
        else:
            self.node["state"] = 1  # visit node
        allow_negatives = True
        isRoot = False
        children = self.node.get("children", [])
        if self.node["type"] == 0:  # we just need to return the score if it is a score node
            return self.node
        elif self.node["type"] == 2:  # scoring multiple choice
            if not self.input.get(self.node["identifier"], False): # if the user did not answer this
                self.node["score"] = 0
                return self.node
            ident = self.node["identifier"]
            # pull the values set in process_node out
            if self.args['script']['language'] == "maxima":
                match = re.search(ident+"_grade : "+r"(?P<grade>.+)\$\n"+ident+"_feedback : "+r"(?P<feedback>.+)\$\n", self.args['script']['value'])
            else:
                match = re.search(ident+"_grade = "+r"(?P<grade>.+)\n"+ident+"_feedback = "+r"(?P<feedback>.+)\n", self.args['script']['value'])
            # print(match.group("grade", "feedback"))
            score = float(match.group("grade"))
            self.node["score"] = score if self.node["allow_negatives"] else max(0, score)
            self.node["feedback"] = [p.strip("\'\"") for p in match.group("feedback").strip("][").split(", ")] if match.group("feedback") != "[]" else ""
            return self.node
        elif self.node["type"] == 1:  # we don't decide root
            if isinstance(self.results, list):
                myBool = self.results[self.node['index']]
                self.node["eval"] = myBool
                bool_str = str(myBool).lower()
                # decide feedback
                self.node["feedback"] = self.node.get("feedback", {}).get(bool_str, '')

                # filter children
                children = [c for c in children if c['bool'] == myBool]
                policy = self.node.get("policy")
                policy = policy.get(bool_str, "sum") if policy else "sum"
            else:
                self.node['eval'] = "Error"
                self.node['feedback'] = self.results
                policy = "sum"
                children = []
        else:
            isRoot = True
            policy = self.node.get("policy", "sum")
            allow_negatives = self.node.get("allow_negatives", allow_negatives)
        # recursively get result from children, THIS CAN BE IMPROVED BY BRANCH CUTTING
        results = [process_node(c, self.input, self.args, self.results) for c in children]
        scores = [r["score"] for r in results]

        # based on the policy, get the score and return

        if policy == "sum":
            score = sum(scores)
            if isRoot and not allow_negatives:
                score = max(score, 0)
            self.node["score"] = score
            for child in children:
                child["state"] = 2  # visited and used
            return self.node

        elif policy == "max":
            score = max(scores)
            if isRoot and not allow_negatives:
                score = max(score, 0)
            self.node["score"] = score
            index = scores.index(score)
            children[index]["state"] = 2
            return self.node

        elif policy == "min":
            score = min(scores)
            if isRoot and not allow_negatives:
                score = max(score, 0)
            self.node["score"] = score
            index = scores.index(score)
            children[index]["state"] = 2
            return self.node


def get_feedback(result, output, full=False, parent=None):
    state = result.get("state")
    if not state:
        return

    feedbacks = []
    current = result.get("feedback", [])
    if isinstance(current, list):
        feedbacks += current
    elif isinstance(current, str) and len(current) > 0:
        feedbacks.append(current)

    if result["type"] == 2:
        output[result["identifier"]] = feedbacks
    else:
        if parent is None:
            output["end"].extend(feedbacks)
        else:
            output[parent] = feedbacks
        children = result.get("children", [])
        for child in children:
            if child.get("state") == 2 or full:
                get_feedback(child, output, full, parent)


# We can use multiple threads to get the result
def process_node(node, ProcInput, args, results):
    return Node(node, ProcInput, args, results).get_result()

def evaluate_tree(tree, inputs, args, mults):
    # set default values to avoid errors
    args['script'] = args.get('script', {})
    args['script']['value'] = args['script'].get('value', '')
    collected = collect_inputs(args, inputs, mults)
    if args['script']['language'] == "maxima":
        args["script"]["value"] = collected + code_convert(args["script"]["value"], "maxima", "_file")
        # if len(args['script']['value']) > 250:
        #     args['script']['value'] = collected + "__target = tmp_filename()\nwith open(__target, 'w') as f:\n\tf.write(\"\"\"\n"+args['script']['value']+"\n\"\"\")\n"
        #     args['script']['value'] += "maxima.eval((\"batchload(\\\"{}\\\");\").format(__target))\n"
        # else:
        #     args['script']['value'] = collected + "maxima.eval(\"\"\"\n"+args['script']['value']+"\n\"\"\")\n"
        args['script']['value'] += collect_conds(tree, args, 0, '__dtree_outs = []\nfor fun in [', {})[1] \
                                + ']:\n\ttry:\n\t\t__dtree_outs.append(maxima.eval(fun))\n\texcept:\n\t\t__dtree_outs.append("Error")\nprint(__dtree_outs)'
    else:
        args['script']['value'] = collected + args['script']['value']
        args['script']['value'] += collect_conds(tree, args, 0, '\n__dtree_outs = []\nfor fun in [', {})[1]\
                                + ']:\n\ttry:\n\t\t__dtree_outs.append(fun())\n\texcept:\n\t\t__dtree_outs.append("Error")\nprint(__dtree_outs)'
    cond_results = evaluate_conds(args)
    return process_node(tree, inputs, args, cond_results)

def collect_inputs(args, inputs, mults):
    out = ''
    algo = False
    language = args['script']['language']
    collected = []
    for k, val in inputs.items():
        # check if the identifier has been assigned a value in the script yet
        if k not in collected:
            collected.append(k)
            # if the identifier is for a multiple choice field
            if k in mults.keys():
                algo = algo or MultipleChoiceComparisonAlgorithm()
                # make 2 copies of the value entered by the student
                val = copy.deepcopy(inputs).get(k, None)
                oval = copy.deepcopy(inputs).get(k, None)
                ans = mults[k]
                val, oval = get_mult_vals(val, oval, algo, ans, args)

                # score the multiple choice field
                grade, feedback = algo.execute(val, ans, args.get("seed", None))
                # make the value, grade, and feedback available to the script
                if language == "maxima":
                    out = code_convert((
                            "{k} : {oval}$\n"+\
                            "{k}_grade : {grade}$\n"+\
                            "{k}_feedback : {feedback}$\n")\
                            .format(k=k, oval=str(oval).replace("\\", "\\\\"), grade=str(grade), feedback=str(feedback)), "maxima", "_"+k)+out
                else:
                    out = k+" = "+str(oval).replace("\\", "\\\\")+"\n"+\
                            k+"_grade = "+str(grade)+"\n"+\
                            k+"_feedback = "+str(feedback)+"\n"+\
                            out
            else:
                # make the value accessible in the scripts
                if language == "maxima":
                    if val is None:
                        out = "maxima.eval(\"{k} : false$\")\n".format(k=k) + out
                    else:
                        out = "maxima.eval(\"{k} : \\\"{val}\\\"$\")\n".format(k=k, val=val) + out
                else:
                    if val is None:
                        out = k+" = None\n" + out
                    else:
                        out = k+" = \""+str(val)+"\"\n" + out
    return out

def get_mult_vals(val, oval, algo, ans, args):
    # if this is from the offline question frame the values haven't been hashed yet
    if args.get("offline", False):
        if isinstance(val, list):
            for i, v in enumerate(val):
                val[i] = algo.hash_text(v, args.get("seed", None))
                oval[i] = algo.get_identifier(v, ans)
        else:
            oval = algo.get_identifier(val, ans)
            val = algo.hash_text(val, args.get("seed", None))
    else:
        # get the value from the hash
        oval = algo.run(val, ans, args.get("seed", None))
        if isinstance(oval, list):
            oval = [p['identifier'] if 'identifier' in p and p['identifier'] else p["text"] for p in oval]
        else:
            oval = oval['identifier'] if 'identifier' in oval and oval['identifier'] else oval["text"]

    pattern = r'<m value="(.*)" />'
    if isinstance(oval, list):
        for i, p in enumerate(oval):
            oval[i] = str2(re.sub(pattern, lambda x: x.group(1), p))
    else:
        oval = "\"" + json.dumps(re.sub(pattern, lambda x: x.group(1), oval)) + "\""
    return val, oval

def collect_conds(tree, args, index, conds, cond_dict):
    for node in tree['children']:
        if node['type'] == 1:
            if node["title"] in cond_dict:
                node['index'] = cond_dict[node["title"]]
            else:
                node['index'] = index
                cond_dict[node["title"]] = index
                index += 1
                if args['script']['language'] == "maxima":
                    conds += '"' + node['title'].replace('"', r'\"') + '", '
                else:
                    conds += 'lambda: ' + node['title'] + ', '
            node, conds, index = collect_conds(node, args, index, conds, cond_dict)
    return tree, conds, index

def evaluate_conds(args):
    url = SAGECELL_URL
    script = args['script']['value']
    seed = args.get("seed", None)
    language = args['script']['language']
    # pre holds the seeding of the randomizer
    # code holds the code to execute for the nodes of the tree
    evaluated = []
    sage = SageCell(url)
    try:
        if language == "maxima":
            pre = "maxima.set_seed({})\n".format(seed)
            script = re.sub(r'\s*/\*.*?\*/\s*\n*', '\n', script)
        else:
            pre = "import random\nrandom.seed({})\n".format(seed)
        code = pre+script
        print(code)
        msg = sage.execute_request(code)
        results = SageCell.get_results_from_message_json(msg).strip()
        results = ast.literal_eval(results)
        for res in results:
            if isinstance(res, bool):
                evaluated.append(res)
            elif res == "true":
                evaluated.append(True)
            elif res in ["false", "unknown"]:
                evaluated.append(False)
            else:
                evaluated.append("Error")
    except ValueError:
        evaluated = "Error occured in question script. Please contact your instructor."
    return evaluated

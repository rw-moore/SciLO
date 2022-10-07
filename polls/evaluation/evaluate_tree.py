import re
import copy
import ast
from api.settings import SAGECELL_URL
from polls.evaluation.evaluate_mathlive import evaluate_mathlive
from ..script.sage_client import SageCell, code_convert

class str2(str):
    def __repr__(self) -> str:
        return ''.join(('"', super().__repr__()[1:-1], '"'))

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
            node_allow = self.node.get("allow_negatives", True)
            self.node["score"] = score if node_allow else max(0, score)
            self.node["feedback"] = [p.strip("\'\"") for p in match.group("feedback").strip("][").split(", ")] if match.group("feedback") != "[]" else ""
            return self.node
        elif self.node['type'] == 3: # score algeb equiv
            if not self.input.get(self.node["identifier"], False): # if the user did not answer this
                self.node["score"] = 0
                return self.node
            if isinstance(self.results, list):
                res = self.results[self.node['index']]
                # res[0] is validity, res[1] is correctness
                if res[0].lower() != 'true' or res[1].lower() != 'true':
                    self.node['score'] = 0
            else:
                self.node['eval'] = "Error"
                self.node['feedback'] = self.results
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

def evaluate_tree(tree, inputs, args):
    # set default values to avoid errors
    args['script'] = args.get('script', {})
    args['script']['value'] = args['script'].get('value', '')
    collected = collect_inputs(args, inputs)
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

def collect_inputs(args, inputs):
    from ..models.algorithm import MultipleChoiceComparisonAlgorithm
    out = ""
    algo = False
    language = args['script']['language']
    collected = []
    for k, val in inputs.items():
        # check if the identifier has been assigned a value in the script yet
        if k not in collected:
            collected.append(k)
            # if the identifier is for a multiple choice field
            if val['type'] == "multiple":
                algo = algo or MultipleChoiceComparisonAlgorithm()
                # make 2 copies of the value entered by the student
                ival = copy.deepcopy(inputs).get(k, {}).get('value', None)
                oval = copy.deepcopy(inputs).get(k, {}).get('value', None)
                ans = val['mults']
                ival, oval = get_mult_vals(ival, oval, algo, ans, args)

                # score the multiple choice field
                grade, feedback = algo.execute(ival, ans, args.get("seed", None))
                # make the value, grade, and feedback available to the script
                if language == "maxima":
                    out = code_convert((
                            "{k} : {oval}$\n"+\
                            "{k}_grade : {grade}$\n"+\
                            "{k}_feedback : {feedback}$\n")\
                            .format(k=k, oval=str(oval).replace("\\", "\\\\"), grade=str(grade), feedback=[str2(x) for x in feedback]), "maxima", "_"+k)+out
                else:
                    out = k+" = "+str(oval).replace("\\", "\\\\")+"\n"+\
                            k+"_grade = "+str(grade)+"\n"+\
                            k+"_feedback = "+str(feedback)+"\n"+\
                            out
            else:
                # make the value accessible in the scripts
                if language == "maxima":
                    if val['value'] is None:
                        out = "maxima.eval(\"{k} : false$\")\n".format(k=k) + out
                    elif val['type'] == "matrix":
                        clean_val = []
                        for row in val['value']:
                            clean_val.append([])
                            for x in row:
                                if isinstance(x, int):
                                    clean_val[-1].append(x)
                                elif isinstance(x, str):
                                    clean_val[-1].append(str2(x))
                                elif x is None:
                                    clean_val[-1].append(str2("false"))
                        out = "maxima.eval(\"\"\"{k} : matrix({val})$\"\"\")\n".format(k=k, val=str2(clean_val)[1:-1]) + out
                    elif val['type'] == 'algebraic':
                        expr = evaluate_mathlive(val['value'], language, val['blockedOps'])
                        out = "maxima.eval(\"{k} : {expr}$\")\n".format(k=k, expr=expr) + out
                    else:
                        out = "maxima.eval(\"{k} : parse_string(\\\"{val}\\\")$\")\n".format(k=k, val=val['value']) + out
                else:
                    if val['value'] is None:
                        out = k+" = None\n" + out
                    elif val['type'] == "matrix":
                        out = k + " = matrix(" + str(val['value']) + ")\n" + out
                    elif val['type'] == 'algebraic':
                        expr, qvars = evaluate_mathlive(val['value'], language, val['blockedOps'])
                        out = "var({vars})\n{k} = {expr}\n".format(vars=qvars.join(','), k=k, expr=expr) + out
                    else:
                        out = k+" = __sage_parser.parse(\""+str(val['value'])+"\")\n" + out
    out = """from sage.misc.parser import Parser, function_map
__sage_parser = Parser(make_function=function_map)
""" + out
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

    pattern = r'<m value="(.*?)" />'
    if isinstance(oval, list):
        for i, p in enumerate(oval):
            oval[i] = str2(re.sub(pattern, lambda x: x.group(1), p))
    else:
        oval = "\"" + re.sub(pattern, lambda x: x.group(1), oval) + "\""
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
        elif node['type'] == 3:
            print("node", node)
            node['index'] = index
            index += 1
            equivalence = 'AT' + node['equivalence']
            if args['script']['language'] == "maxima":
                conds += '"{}('.format(equivalence) + node['identifier'].replace('"', r'\"') + ', ' + node['correct'].replace('"', r'\"') + ')", '
            else:
                conds += 'lambda: maxima.eval("{}('.format(equivalence) + node['identifier'].replace('"', r'\"') + ', ' + node['correct'].replace('"', r'\"') + ')"), '
            
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
        stack_eval = 'maxima.eval(\'file_search_maxima: append(file_search_maxima, [\"/home/corlick/stack/stack/maxima/###.{mac,lisp}\"])$\')\n' + \
                'maxima.eval(\'batchload(\"stackmaxima.mac\")\')\n'
        if language == "maxima":
            pre = "maxima.set_seed({})\n".format(seed)
            script = re.sub(r'\s*/\*.*?\*/\s*\n*', '\n', script)
        else:
            pre = "import random\nrandom.seed(int({}))\n".format(seed)
        code = pre + stack_eval + script
        print(code)
        msg = sage.execute_request(code)
        results = SageCell.get_results_from_message_json(msg).strip()
        results = ast.literal_eval(results)
        print("results", results)
        for res in results:
            if isinstance(res, bool):
                evaluated.append(res)
            elif res == "true":
                evaluated.append(True)
            elif res in ["false", "unknown"]:
                evaluated.append(False)
            elif res[0] == '[' and res[-1] == ']':
                evaluated.append(res[1:-1].split(','))
            else:
                evaluated.append("Error")
    except ValueError:
        evaluated = "Error occured in question script. Please contact your instructor."
    return evaluated

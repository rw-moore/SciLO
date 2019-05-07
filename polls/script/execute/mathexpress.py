#!/usr/bin/env sage
#pylint:disable=all
import sys
import json
from sage.all import *
from sage.calculus.calculus import symbolic_expression_from_string


def numerical(attempt, answers, args):
    # answer list of objects
    if args.get('exclude', None):
        exclude = args['exclude']
    else:
        exclude = []

    for term in exclude:
        # validate student answer
        if term in attempt['answers_string']:
            return json.dumps([])

    r = []
    attempt_value = symbolic_expression_from_string(
        attempt['answers_string']
    )

    for answer in answers:
        answer_value = symbolic_expression_from_string(
            answer['content']
        )
        diff = (answer_value - attempt_value).full_simplify()
        if diff.__repr__() == '0':
            r.append(answer)
    return json.dumps(r)


if __name__ == "__main__":
    # student_answer, prof_answers
    if len(sys.argv) < 4:
        print("sage mathexpress.py answer answers args")
        exit(0)

    student_answer = json.loads(sys.argv[1])
    answers = json.loads(sys.argv[2])
    args = json.loads(sys.argv[3])

    print(numerical(student_answer, answers, args))

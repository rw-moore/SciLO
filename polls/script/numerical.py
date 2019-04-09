#!/usr/bin/env sage
import sys
from sage.all import *
import json

def numerical(attempt, answers, args):
    # answer list of objects
    if args['precision_type'] == 'digits':
        digits = int(args['precision_value'])
    else:
        digits = 0

    r = []
    attempt_value = sage_eval(
        attempt['answers_string']
    ).numerical_approx(
        digits=digits
    )

    for answer in answers:
        answer_value = sage_eval(
            answer['content']
        ).numerical_approx(
            digits=digits
        )
        diff = sage_eval("({})-({})".format(answer_value, attempt_value))
        if diff == 0:
            r.append(answer)
    return json.dumps(r)



if __name__ == "__main__":
    # student_answer, prof_answers
    if len(sys.argv) < 4:
        print("sage numerical.py answer answers args")
        exit(0)
    student_answer = json.loads(sys.argv[1])
    answers = json.loads(sys.argv[2])
    args = json.loads(sys.argv[3])
    print(numerical(student_answer, answers, args))



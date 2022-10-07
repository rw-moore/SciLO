from collections import deque
import xml.sax as sax
import html, sys

class BlockedOperatorException(Exception):
    def __init__(self, operator):
        self.operator = operator
    def __str__(self):
        return 'Invalid Operator: '+self.operator

def getPrecedence(c):
    if c in ['pow', 'sqrt']:
        return 3
    elif c in ['⋅', '/', html.unescape('&#8290;'), '∗']:
        return 2
    elif c == '=':
        return 0
    return 1

allowed_function_names = {
    "sin": "sin",
    "arcsin": {"python": "arcsin", "maxima":"asin"},
    "sinh": "sinh",
    "arsinh": "asinh",
    "cosec": "csc",
    "arccsc": {"python": "arccsc", "maxima":"acsc"},
    "cos": "cos",
    "arccos": {"python": "arccos", "maxima": "acos"},
    "cosh": "cosh",
    "arcosh": "acosh",
    "sec": "sec",
    "arcsec": {"python": "arcsec", "maxima": "asec"},
    "tan": "tan",
    "arctan": {"python": "arctan", "maxima": "atan"},
    "tanh": "tanh",
    "artanh": "atanh",
    "cot": "cot",
    "arccot": {"python": "arccot", "maxima":"acot"},
}

CONSTANTS = {
    html.unescape("&#x03c0;"): {"python": "pi", "maxima":"%pi"}
}

class MathMLHandler( sax.ContentHandler ):
    def __init__(self, DEBUG):
        self.queue = deque()
        self.stack = deque()
        self.parents = []
        self.check_unary = True
        self.vars = {}
        self.is_diff = False
        self.DEBUG = DEBUG

    def __enter__(self):
        return self

    def parse(self, f):
        sax.parseString(f, self)
        while self.stack:
            self.queue.append(self.stack.pop())
        return self.queue, self.vars

    # Call when an element starts
    def startElement(self, tag, attributes):
        if self.DEBUG:
            print("enter", tag)
        self.parents.append(tag)
        if tag == 'msqrt':
            self.queue.append('wall')
        elif tag in ['mrow', 'msup']:
            self.check_unary = True
            self.stack.append('(')
        if self.DEBUG:
            print(self.queue, self.stack)

    # Call when parse contents of an element
    def characters(self, content):
        if self.DEBUG:
            print('char', content)
        if self.check_unary:
            self.check_unary = False
            if content in ['+', '−']:
                self.queue.append("0")
        if content.isdigit():
            self.queue.append(content)
        elif content == '(':
            self.check_unary = True
            self.stack.append(content)
        elif content == ')':
            while self.stack[-1] != '(':
                self.queue.append(self.stack.pop())
            self.stack.pop()
        elif content in ['+', '⋅', '−', html.unescape('&#8290;'), '∗']:
            while self.stack and self.stack[-1] != '(' and getPrecedence(content) <= getPrecedence(self.stack[-1]):
                self.queue.append(self.stack.pop())
            self.stack.append(content)
        elif content == '=':
            self.stack.append('=')
        elif content == '|':
            self.stack.append("abs")
        elif content == '∑':
            self.stack.append("summation")
        elif content == '∫':
            if self.parents[-2] == "msubsup":
                self.stack.append("integration")
            else:
                self.stack.append("dintegration")
        elif content == '∬':
            self.stack.append("iintegration")
        elif content == '∭':
            self.stack.append('iiintegration')
        elif content in allowed_function_names:
            self.stack.append(content)
        elif content in CONSTANTS:
            self.queue.append(content)
        else: 
            if self.DEBUG:
                print("unhandled", content)
            if content == 'd' and 'integration' in list(self.stack)[-2:] and not self.is_diff:
                if self.DEBUG:
                    print('setting is_diff')
                self.is_diff = True
                self.queue.append(content)
                while self.stack[-1] != 'integration':
                    self.stack.pop()
            else:
                if self.is_diff:
                    if self.DEBUG:
                        print('unsetting is_diff')
                    self.is_diff = False
                    self.stack.pop()
                    self.queue.append(self.queue.pop()+"_"+content)
                    self.queue.append(self.stack.pop())
                else:
                    self.queue.append("_"+content)
                    self.vars["_"+content] = True
        if self.DEBUG:
            print(self.queue, self.stack)


    # Call when an elements ends
    def endElement(self, tag):
        if self.DEBUG:
            print("exit", tag)
        self.parents.pop()
        if tag == 'mfrac':
            while self.stack and self.stack[-1] != '(' and getPrecedence("/") < getPrecedence(self.stack[-1]):
                self.queue.append(self.stack.pop())
            self.queue.append("/")
        elif tag == 'msqrt':
            while self.stack and self.stack[-1] != '(' and getPrecedence("pow") <= getPrecedence(self.stack[-1]):
                self.queue.append(self.stack.pop())
            self.queue.append("sqrt")
        elif tag == 'msup':
            while self.stack[-1] != '(':
                self.queue.append(self.stack.pop())
            self.stack.pop()
            self.queue.append('pow')
        elif tag == 'mrow':
            while self.stack[-1] != '(':
                self.queue.append(self.stack.pop())
            self.stack.pop()
        elif tag == 'mroot':
            self.queue.append('nroot')
        if self.DEBUG:
            print(self.queue, self.stack)

def check_blocked(op_type, blocked_ops):
    if op_type in blocked_ops:
        raise BlockedOperatorException(op_type)

def eval_rpn(rpn, language, blocked_ops, DEBUG):
    stack = deque()
    if DEBUG:
        print("starting q", rpn)
    while rpn:
        token = rpn.popleft()
        if token == '+':
            check_blocked('arithmetic', blocked_ops)
            stack.append("("+stack.pop()+"+"+stack.pop()+")")
        elif token == '−':
            check_blocked('arithmetic', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+"-"+first+")")
        elif token == '/':
            check_blocked('arithmetic', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+"/"+first+")")
        elif token in ['⋅','∗',]:
            check_blocked('arithmetic', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+"*"+first+")")
        elif token == 'pow':
            check_blocked('arithmetic', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            if language == "python":
                stack.append("("+second+"**"+first+")")
            elif language == "maxima":
                stack.append("("+second+"^"+first+")")
        elif token == 'wall':
            pass
        elif token == 'sqrt':
            check_blocked('arithmetic', blocked_ops)
            stack.append("sqrt("+stack.pop()+")")
        elif token == 'nroot':
            check_blocked('arithmetic', blocked_ops)
            root = stack.pop()
            expr = stack.pop()
            if language == 'python':
                stack.append("(("+expr+")**"+"(1/"+root+"))")
            elif language == 'maxima':
                stack.append("(("+expr+")^"+"(1/"+root+"))")
        elif token == 'abs':
            check_blocked('arithmetic', blocked_ops)
            if rpn[0] == 'abs':
                stack.append("abs("+stack.pop()+")")
                rpn.popleft()
        elif token == 'summation':
            check_blocked('arithmetic', blocked_ops)
            expr = stack.pop()
            upper = stack.pop()
            stack.pop() # remove '='
            lower = stack.pop()
            varname = stack.pop()
            if language == 'python':
                stack.append("({}).sum({},{},{})".format(expr, varname, lower, upper))
            elif language == 'maxima':
                stack.append("sum({},{},{},{})".format(expr, varname, lower, upper))
        elif token == 'integration':
            print('int stack', stack)
            if stack[-1] == html.unescape('&#8290;'):
                stack.pop()
            varname = stack.pop()[1:]
            expr = stack.pop()
            upper = stack.pop()
            lower = stack.pop()
            if language == 'python':
                stack.append("({}).integral({},{},{})".format(expr,varname,lower,upper))
            elif language == 'maxima':
                stack.append('integrate({},{},{},{}'.format(expr, varname, lower, upper))
        elif token == 'dintegration':
            if stack[-1] == html.unescape('&#8290'):
                stack.pop()
            varname = stack.pop()
            stack.pop()
            expr = stack.pop()
            if language == 'python':
                stack.append("({}).integral({})".format(expr,varname))
            elif language == 'maxima':
                stack.append("integrate({},{})".format(expr,varname))
        elif token == 'iintegration':
            print('iint stack', stack)
            stack.pop()
            var1 = stack.pop()
            stack.pop();stack.pop();stack.pop()
            var2 = stack.pop()
            stack.pop();stack.pop()
            expr = stack.pop()
            if language == 'python':
                stack.append("({}).integral({}).integral({})".format(expr, var1,var2))
            elif language == 'maxima':
                stack.append("integrate(integrate({},{}),{})".format(expr,var1,var2))
        elif token == 'iiintegration':
            print('iiint stack', stack)
            stack.pop()
            var1 = stack.pop()
            stack.pop();stack.pop();stack.pop()
            var2 = stack.pop()
            stack.pop();stack.pop();stack.pop()
            var3 = stack.pop()
            stack.pop();stack.pop()
            expr = stack.pop()
            if language == 'python':
                stack.append("({}).integral({}).integral({}).integral({})".format(expr,var1,var2,var3))
            elif language == 'maxima':
                stack.append("integrate(integrate(integrate({},{}),{}),{})".format(expr,var1,var2,var3))
            pass
        elif token in allowed_function_names:
            var1 = stack.pop()
            if isinstance(allowed_function_names[token], dict):
                stack.append("{}({})".format(allowed_function_names[token][language], var1))
            else:
                stack.append("{}({})".format(allowed_function_names[token], var1))
        elif token in CONSTANTS:
            if isinstance(CONSTANTS[token], dict):
                stack.append(CONSTANTS[token][language])
            else:
                stack.append(CONSTANTS[token])
        else:
            stack.append(token)
        if DEBUG:
            print("after token:",token, "stack:", stack)
    if DEBUG:
        print("final stack", stack)
    return stack.pop()

def evaluate_mathlive(mathml, language, blocked_ops, DEBUG=False):
    print("mathml", mathml)
    rpn_out, var_names = MathMLHandler(DEBUG).parse(mathml)
    print("rpn" ,rpn_out)
    print("varnames", var_names)
    out = eval_rpn(rpn_out, language, blocked_ops, DEBUG)
    return out

if __name__ == '__main__':
    test_strings = [
        # tests unary-,+,-,*,^,sqrt,frac,
        "<mfrac><mrow><mo>−</mo><mi>b</mi><mo>+</mo><msqrt><mrow><msup><mi>b</mi><mn>2</mn></msup><mo>−</mo><mn>4</mn><mo>⋅</mo><mi>a</mi><mo>⋅</mo><mi>c</mi></mrow></msqrt></mrow><mrow><mn>2</mn><mo>⋅</mo><mi>a</mi></mrow></mfrac>",
        # tests different combinations of sqrt, frac, *, /
        "<mrow><msqrt><mfrac><mn>1</mn><mn>2</mn></mfrac></msqrt><mo>⋅</mo><mfrac><msup><mi>x</mi><mn>2</mn></msup><mi>x</mi></mfrac></mrow>",
        # tests abs
        "<mrow><mo>|</mo><mrow><mn>1</mn><mo>−</mo><mrow><mo>|</mo><mi>x</mi><mo>|</mo></mrow></mrow><mo>|</mo></mrow>",
        # tests nth root
        "<mroot><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mi>y</mi></mroot>",
        # tests summation
        "<dummy_root><msubsup><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>1</mn><mo>+</mo><mn>0</mn></mrow><mrow><mn>2</mn><mo>⋅</mo><mn>5</mn></mrow></msubsup><mrow><mn>5</mn><mo>⋅</mo><msup><mi>n</mi><mn>2</mn></msup></mrow></dummy_root>",
        # single definite integral
        "<mrow><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><mrow><mo>(</mo><mrow><mn>5</mn><mo>⋅</mo><msup><mi>x</mi><mn>2</mn></msup></mrow><mo>)</mo></mrow><mi>d</mi><mo>&#8290;</mo><mi>x</mi></mrow>",
        # single indefinite integral
        "<mrow><mo>∫</mo><mrow><mo>(</mo><mrow><mn>5</mn><mo>⋅</mo><msup><mi>x</mi><mn>2</mn></msup></mrow><mo>)</mo></mrow><mi>d</mi><mo>&#8290;</mo><mi>x</mi></mrow>",
        # double definite integral
        "<mrow><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><mo>(</mo><mn>5</mn><mo>⋅</mo><mi>x</mi><mo>⋅</mo><msup><mi>y</mi><mn>2</mn></msup><mo>)</mo><mi>d</mi><mo>&#8290;</mo><mi>x</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>y</mi></mrow>",
        # double indefinite integral
        "<mrow><mo>∬</mo><mrow><mo>(</mo><mrow><mn>5</mn><mo>∗</mo><mi>x</mi><mo>∗</mo><msup><mi>y</mi><mn>2</mn></msup></mrow><mo>)</mo></mrow><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>x</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>y</mi></mrow>",
        # triple definite integral
        "<mrow><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><mrow><mo>(</mo><mrow><mn>5</mn><mo>⋅</mo><mi>x</mi><mo>⋅</mo><mi>y</mi><mo>⋅</mo><mi>z</mi></mrow><mo>)</mo></mrow><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>x</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>y</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>z</mi></mrow>",
        # triple indefinite integral
        "<mrow><mo>∭</mo><mrow><mo>(</mo><mrow><mn>5</mn><mo>⋅</mo><mi>x</mi><mo>⋅</mo><mi>y</mi><mo>⋅</mo><mi>z</mi></mrow><mo>)</mo></mrow><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>x</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>y</mi><mo>&#8290;</mo><mi>d</mi><mo>&#8290;</mo><mi>z</mi></mrow>",
        # sin
        "<mrow><mi>x</mi><mo>⋅</mo><mo>sin</mo><mrow><mo>(</mo><mfrac><mn>&#x03c0;</mn><mn>4</mn></mfrac><mo>)</mo></mrow></mrow>",
    ]
    if len(sys.argv) > 1:
        num = int(sys.argv[-1])
    else:
        num = -1
    language = "python"
    blocked_ops = []
    print("evaluating", test_strings[num])
    print("result", evaluate_mathlive(test_strings[num], language, blocked_ops, True))

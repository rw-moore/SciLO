from collections import deque
import xml.sax as sax
import html, sys, re

class BlockedOperatorException(Exception):
    def __init__(self, operator):
        self.operator = operator
    def __str__(self):
        return 'Invalid Operator: '+self.operator

class str2(str):
    def __repr__(self) -> str:
        return ''.join(('"', super().__repr__()[1:-1], '"'))

def getPrecedence(c):
    if c in ['pow', 'sqrt']:
        return 4
    elif c in ['⋅', '/', html.unescape('&#8290;'), '∗', ]:
        return 3
    elif c in ['+', '−']:
        return 2
    elif c in ['=', '>']:
        return 1
    elif c in ['union', 'intersection']:
        return 0
    print('unknown precedence', c)
    return 1

def maxima_clean_matrix(val):
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
    return clean_val

FUNCTION_NAME_CONVERSION = {
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
    "arccot": {"python": "arccot", "maxima": "acot"},

    "ln": "log",
    "log": "logb"
}

BINARY_OPERATORS = {
    '+': '+', 
    '⋅': '⋅', 
    '−': '−', 
    html.unescape('&#8290;'): html.unescape('&#8290;'), 
    '∗': '∗', 
    html.unescape('&#x222A;'): 'union',
    html.unescape('&#x2229;'): 'intersection',
    html.unescape('&gt;'): '>',
    html.unescape('&lt;'): '<',
    html.unescape('&#x2264;'): '<='
    
}

CONSTANTS = {
    html.unescape("&#x03c0;"): {"python": "pi", "maxima":"%pi"},
    "e": {"python":"e", "maxima":"%e"},
    '\\EulerNumber': {"python":"e", "maxima":"%e"},
    '\\ImaginaryUnit': {"python": "i", "maxima":"%i"},
    '\\JQuaternion': {"python": "j", "maxima": "j", "prereq": "quaternion"},
    '\\KQuaternion': {"python": "k", "maxima": "k", "prereq": "quaternion"},
    '\\Infinity': {'python': 'Infinity', 'maxima': 'inf'},
}

SET_BOUNDARIES = {
    'open': {
        '\\SetOpenP': 'o',
        '\\SetOpenB': 'c',
    },
    'close': {
        '\\SetCloseP': 'o',
        '\\SetCloseB': 'c',
    },
}

NUMERIC_CONSTANTS = {
    '\\EulerNumber': 2.7182818284,
    '\\GoldenRation': 1.6180339887,

    '\\GravitationConstant': 5.6743e-11,
    '\\SpeedOfLight': 299792458,
    '\\PlanckConstant': 6.62607015e-34,
    '\\ReducedPlanckConstant': 1.054571817e-34,
    '\\VacuumMagneticPermeability': 1.25663706212e-6,
    '\\VacuumElectricPermittivity': 8.8541878128e-12,
    '\\BoltzmannConstant': 1.380649e-23,
    '\\StefanBoltzmannConstant': 5.670374419e-8,
    '\\ElementaryCharge': 1.602176634e-19,
    '\\FineStructureConstant': 7.2973525693e-3,

    '\\AvogadroNumber': 6.02214076e23,
    '\\MassElectron': 9.1093837015e-31,
    '\\MassProton': 1.67262192369e-27,
    '\\MassNeutron': 1.67492749804e-27,
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
        elif tag == 'mtable':
            self.queue.append('start table')
        elif tag == 'mtr':
            self.queue.append('start row')
        elif tag == 'mtd':
            self.stack.append('(')
        if self.DEBUG:
            print(self.queue, self.stack)

    # Call when parse contents of an element
    def characters(self, content):
        if content.isspace():
            return
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
        elif content in BINARY_OPERATORS:
            content = BINARY_OPERATORS[content]
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
        elif content in FUNCTION_NAME_CONVERSION:
            self.stack.append(content)
        elif content in CONSTANTS:
            self.queue.append(content)
        elif content in NUMERIC_CONSTANTS:
            self.queue.append(content)
        elif content == html.unescape('&#x2061;'): # function application
            pass
        elif content in SET_BOUNDARIES['open']:
            self.check_unary = True
            self.stack.append(content)
        elif content in SET_BOUNDARIES['close']:
            while self.stack and self.stack[-1] not in SET_BOUNDARIES['open']:
                self.queue.append(self.stack.pop())
            set_open = SET_BOUNDARIES['open'][self.stack.pop()]
            set_close = SET_BOUNDARIES['close'][content]
            self.queue.append(set_open+set_close)
        elif content  == ',':
            if self.stack and self.stack[-1] == '−':
                self.queue.append(self.stack.pop())
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
        elif tag == 'mtable':
            self.queue.append('end table')
        elif tag == 'mtr':
            self.queue.append('end row')
        elif tag == 'mtd':
            while self.stack[-1] != '(':
                self.queue.append(self.stack.pop())
            self.stack.pop()
        if self.DEBUG:
            print(self.queue, self.stack)

def check_blocked(op_type, blocked_ops):
    if op_type in blocked_ops:
        raise BlockedOperatorException(op_type)

def eval_rpn(rpn, language, blocked_ops, DEBUG):
    stack = deque()
    prereqs = set()
    if DEBUG:
        print("starting q", rpn)
    if len(rpn) == 0:
        return None, prereqs
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
        elif token == '=':
            check_blocked('arithmetic', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+"="+first+")")
        elif token == '>':
            check_blocked('sets', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+">"+first+")")
        elif token =='<':
            check_blocked('sets', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append("("+second+">"+first+")")
        elif token in ['oo', 'oc', 'co', 'cc']:
            check_blocked('sets', blocked_ops)
            print('interval stack', stack)
            first = stack.pop()
            second = stack.pop()
            stack.append(f'{token}({second}, {first})')
        elif token == 'union':
            print('union stack', stack)
            check_blocked('sets', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append(f'%union({second}, {first})')
        elif token == 'intersection':
            print('intersection stack', stack)
            check_blocked('sets', blocked_ops)
            first = stack.pop()
            second = stack.pop()
            stack.append(f'%intersection({second}, {first})')
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
            bottom = stack.pop() # ex. (_n=(0+1))
            m = re.match('^\((.*?)=(.*)\)$', bottom)
            lower = m.group(2)
            varname = m.group(1)
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
        elif token == "end table":
            print('matrix stack', stack)
            vals = []
            while stack[-1] != 'start table':
                stack.pop() # end row
                vals.append([])
                while stack[-1] != 'start row':
                    vals[-1].append(stack.pop())
                stack.pop() # start row
                vals[-1].reverse()
                vals[-1] = ','.join(vals[-1])
            vals.reverse()
            stack.pop() # start table
            if language == 'python':
                out = "matrix(["
                for row in vals[:-1]:
                    out += "[{}],".format(row)
                out += '[{}]])'.format(vals[-1])
                stack.append(out)
            elif language == 'maxima':
                out = "matrix("
                for row in vals[:-1]:
                    out += "[{}],".format(row)
                out += '[{}])'.format(vals[-1])
                stack.append(out)
        elif token == "log":
            val = stack.pop()
            base = stack.pop()
            if language == "python":
                stack.append("logb({},{})".format(val, base))
            else:
                stack.append("(log({})/log({}))".format(val, base))
        elif token in FUNCTION_NAME_CONVERSION:
            var1 = stack.pop()
            if isinstance(FUNCTION_NAME_CONVERSION[token], dict):
                stack.append("{}({})".format(FUNCTION_NAME_CONVERSION[token][language], var1))
            else:
                stack.append("{}({})".format(FUNCTION_NAME_CONVERSION[token], var1))
        elif token in CONSTANTS:
            if isinstance(CONSTANTS[token], dict):
                stack.append(CONSTANTS[token][language])
                if "prereqs" in CONSTANTS[token]:
                    prereqs.add(CONSTANTS[token]["prereqs"])
            else:
                stack.append(CONSTANTS[token])
        elif token in NUMERIC_CONSTANTS:
            stack.append(NUMERIC_CONSTANTS[token])
        else:
            stack.append(token)
        if DEBUG:
            print("after token:",token, "stack:", stack)
    if DEBUG:
        print("final stack", stack)
    return stack.pop(), prereqs

def evaluate_mathlive(mathml, language, blocked_ops, DEBUG=False):
    print("mathml", mathml)
    rpn_out, var_names = MathMLHandler(DEBUG).parse(mathml)
    print("rpn" ,rpn_out)
    print("varnames", var_names)
    out, prereqs = eval_rpn(rpn_out, language, blocked_ops, DEBUG)
    return out, prereqs

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
        # matrix
        "<mrow><mo>(</mo><mtable columnalign=\"center center center center center center center center center center \"><mtr><mtd><mn>1</mn></mtd><mtd><mn>2</mn></mtd><mtd><mn>3</mn></mtd></mtr><mtr><mtd><mn>4</mn></mtd><mtd><mn>5</mn></mtd><mtd><mn>6</mn></mtd></mtr><mtr><mtd><mn>7</mn></mtd><mtd><mrow><mn>8</mn><mo>+</mo><mn>3</mn></mrow></mtd><mtd><mn>9</mn></mtd></mtr></mtable><mo>)</mo></mrow>",
        # ln
        "<mrow><mo>ln</mo><mrow><mo>(</mo><mrow><mn>2</mn><mo>+</mo><mn>7</mn></mrow><mo>)</mo></mrow></mrow>",
        # log_x y
        "<dummyroot><msub><mo>log</mo><mn>10</mn></msub><mrow><mo>(</mo><mn>200</mn><mo>)</mo></mrow></dummyroot>",
        # -inf < x <= 5 Union 6 < x < inf
        # "<math xmlns=\"http://www.w3.org/1998/Math/MathML\">\n  <mo>&#x2212;<!-- − --></mo>\n  <mtext mathcolor=\"red\">\\Infinity</mtext>\n  <mo>&lt;</mo>\n  <mi>x</mi>\n  <mo>&#x2264;<!-- ≤ --></mo>\n  <mn>5</mn>\n  <mo>&#x222A;<!-- ∪ --></mo>\n  <mn>6</mn>\n  <mo>&lt;</mo>\n  <mi>x</mi>\n  <mo>&lt;</mo>\n  <mtext mathcolor=\"red\">\\Infinity</mtext>\n</math>",
        # (-inf, 5) Union [5, 6]
        "<math xmlns=\"http://www.w3.org/1998/Math/MathML\">\n  <mtext mathcolor=\"red\">\\SetOpenP</mtext>\n  <mo>&#x2212;<!-- − --></mo>\n  <mtext mathcolor=\"red\">\\Infinity</mtext>\n  <mo>,</mo>\n  <mn>5</mn>\n  <mtext mathcolor=\"red\">\\SetCloseP</mtext>\n  <mo>&#x222A;<!-- ∪ --></mo>\n  <mtext mathcolor=\"red\">\\SetOpenB</mtext>\n  <mn>5</mn>\n  <mo>,</mo>\n  <mn>6</mn>\n  <mtext mathcolor=\"red\">\\SetCloseB</mtext>\n</math>"
    ]
    if len(sys.argv) > 1:
        num = int(sys.argv[-1])
    else:
        num = -1
    language = "maxima"
    blocked_ops = []
    print("evaluating", test_strings[num])
    out, prereqs = evaluate_mathlive(test_strings[num], language, blocked_ops, True)
    print("prereqs", prereqs)
    print("result", out)

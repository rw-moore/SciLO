from flask import Flask, jsonify
from flask import request
import json
from sage.all import *

app = Flask(__name__)

def generate_results_script(results_array):
    script = '_results = { '
    for i in results_array:
        script += '"{}":{},'.format(i,i)
    script += '}'
    return script

def process_script(_script1, _script2):
    _results = {}
    exec(_script1)
    exec(_script2)
    return _results

@app.route('/', methods=['GET', 'POST'])
def sage():
    if request.method == 'POST':
        _body = json.loads(request.data)
        _script = _body.get('script', None)
        _results_array = _body.get('results', None)
        if _script and _results_array:
            _script2 = generate_results_script(_results_array)
            export_vars = process_script(_script,_script2)
            if isinstance(export_vars, dict):
                for k,v in export_vars.items():
                    export_vars[k] = str(v)
            return jsonify(export_vars)
        else:
            return '{}'
    else:
        return jsonify({})


app.run(debug=True)
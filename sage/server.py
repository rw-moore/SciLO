from flask import Flask
from flask import request
import json as _scilo_json
from sage.all import *

app = Flask(__name__)


def _scilo_generate_results_script(_scilo_results_array, _scilo_script_latex=True):
    _scilo_script = '_scilo_results = { '
    if _scilo_script_latex:
        for _scilo_i in _scilo_results_array:
            _scilo_script += '"{}": latex({}),'.format(_scilo_i, _scilo_i)
    else:
        for _scilo_i in _scilo_results_array:
            _scilo_script += '"{}":{},'.format(_scilo_i, _scilo_i)
    _scilo_script += '}'
    return _scilo_script


def _scilo_process_script(_scilo_fix, _scilo_script1, _scilo_script2):
    _scilo_results = {}
    exec(_scilo_fix)
    exec(_scilo_script1)
    exec(_scilo_script2)
    return _scilo_results



@app.route('/', methods=['GET', 'POST'])
def sage():
    if request.method == 'POST':
        _scilo_body = _scilo_json.loads(request.data)
        _scilo_fix = _scilo_body.get('fix', None)
        _scilo_script = _scilo_body.get('script', None)
        _scilo_results_array = _scilo_body.get('results', None)
        _scilo_script_latex = _scilo_body.get('latex', True)
        if _scilo_script and _scilo_results_array:
            _scilo_script2 = _scilo_generate_results_script(_scilo_results_array, _scilo_script_latex)
            _scilo_export_vars = _scilo_process_script(_scilo_fix, _scilo_script, _scilo_script2)
            if isinstance(_scilo_export_vars, dict):
                for _scilo_k, _scilo_v in _scilo_export_vars.items():
                    _scilo_export_vars[_scilo_k] = str(_scilo_v).replace('\n','')
            return _scilo_json.dumps(_scilo_export_vars)
        else:
            return '{}'
    else:
        return '{}'


app.run(debug=True)

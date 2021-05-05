#!/usr/bin/env python
"""
A small client illustrating how to interact with the Sage Cell Server, version 2

Requires the websocket-client package: http://pypi.python.org/pypi/websocket-client
"""

import json
import requests
import websocket
from api.settings import SAGECELL_URL

def code_convert(code, language):
    if language in ['python', 'sage']:
        return code
    elif language == 'maxima':
        if len(code) > 250:
            return "__target = tmp_filename()\nwith open(__target, 'w') as f:\n\tf.write(\"\"\"\n"+code+"\n\"\"\")\n" + \
                    "maxima.eval((\"batchload(\\\"{}\\\");\").format(__target))\n"
        return 'maxima.eval("""{}""")'.format(code)


class SageCell():

    def __init__(self, url, timeout=10):
        if not url.endswith('/'):
            url += '/'
        # POST or GET <url>/kernel
        # if there is a terms of service agreement, you need to
        # indicate acceptance in the data parameter below (see the API docs)
        response = requests.post(
            url + 'kernel',
            data={'accepted_tos': 'true'},
            headers={'Accept': 'application/json'}).json()
        # RESPONSE: {"id": "ce20fada-f757-45e5-92fa-05e952dd9c87", "ws_url": "ws://localhost:8888/"}
        # construct the websocket channel url from that
        self.kernel_url = '{ws_url}kernel/{id}/'.format(**response)
        websocket.setdefaulttimeout(timeout)
        websocket.enableTrace(True)
        self._ws = websocket.create_connection(
            self.kernel_url + 'channels',
            header={'Jupyter-Kernel-ID': response['id']})
        # initialize our list of messages
        self.shell_messages = []
        self.iopub_messages = []

    def execute_request(self, code):
        # zero out our list of messages, in case this is not the first request
        self.shell_messages = []
        self.iopub_messages = []

        # Send the JSON execute_request message string down the shell channel
        msg = self._make_execute_request(code)

        self._ws.send(msg)

        # Wait until we get both a kernel status idle message and an execute_reply message
        got_execute_reply = False
        got_idle_status = False
        while not (got_execute_reply and got_idle_status):
            msg = json.loads(self._ws.recv())
            if msg['channel'] == 'shell':
                # self.shell_messages.append(msg)
                # an execute_reply message signifies the computation is done
                if msg['header']['msg_type'] == 'execute_reply':
                    got_execute_reply = True
            elif msg['channel'] == 'iopub':
                # the kernel status idle message signifies the kernel is done
                if (msg['header']['msg_type'] == 'status' and
                        msg['content']['execution_state'] == 'idle'):
                    got_idle_status = True
                else:
                    self.iopub_messages.append(msg.get('content', {}))

        return {'shell': self.shell_messages, 'iopub': self.iopub_messages}

    def _make_execute_request(self, code):
        from uuid import uuid4
        session = str(uuid4())

        # Here is the general form for an execute_request message
        execute_request = {
            'channel': 'shell',
            'header': {
                'msg_type': 'execute_request',
                'msg_id': str(uuid4()),
                'username': '', 'session': session,
            },
            'parent_header': {},
            'metadata': {},
            'content': {
                'code': code,
                'silent': False,
                'user_expressions': {
                    '_sagecell_files': 'sys._sage_.new_files()',
                },
                'allow_stdin': False,
            }
        }
        return json.dumps(execute_request)

    @staticmethod
    def get_results_from_message_json(msgs):
        iopub = msgs.get('iopub', [])
        results = ''
        # print(iopub)
        for one_stream in iopub:
            if one_stream.get('data', None):
                results += one_stream['data'].get('text/plain', '')
            elif one_stream.get('text', None) and  one_stream.get('name', None) == 'stdout':
                results += one_stream['text']
        if iopub[-1].get('ename', None):
            raise ValueError({"error": iopub[-1]['ename'], "info": iopub[-1]['evalue'], "traceback": iopub[-1]['traceback']})
        return results

    @staticmethod
    def get_code_from_body_json(body):
        fix_var = body.get('fix', '')
        script_var = body.get('script', '')
        language = body.get('language', '')
        results_array = body.get('results', [])
        is_latex = body.get('latex', True)
        seed = body.get('seed', None)
        # print('language: ',language)
        # print('results:', results_array)
        if language in ['sage', 'python']:
            pre = 'import random\nrandom.seed({})\n'.format(seed)
            code = "import json,re\nfrom sage.misc.latex import MathJax\n__sage_mj=MathJax()\n"+code_convert(pre+'\n'+fix_var+'\n'+script_var, language)+'\n'+'print(json.dumps({'
            for v in results_array:
                if is_latex:
                    code += '"{0}": re.sub(r"</script></html>","",re.sub(r"<html><script.*?>","",str(__sage_mj({0})))),'.format(v)
                else:
                    code += '"{0}": str({0}),'.format(v)
            code += '}))'
        elif language == 'maxima':
            pre = "maxima.set_seed({})\n".format(seed)
            code = "import json,re\nfrom sage.misc.latex import MathJax\n__sage_mj=MathJax()\n"+pre+code_convert(fix_var+'\n'+script_var, language)+'\n'+'print(json.dumps({'
            for v in results_array:
                if is_latex:
                    code += '"{0}": re.sub(r"</script></html>","",re.sub(r"<html><script.*?>","",str(__sage_mj(maxima("{0}"))))),'.format(v)
                else:
                    code += '"{0}": str(m.get("{0}")),'.format(v)
            code += '}))'
        return code

    def close(self):
        # If we define this, we can use the closing() context manager to automatically close the channels
        self._ws.close()

if __name__ == "__main__":
    # sage_url = 'https://sagecell.sagemath.org'
    sage_url = SAGECELL_URL
    print(sage_url)
    sage_cell = SageCell(sage_url)
    # data = "a=1, b=2"
    # code = SageCell.get_code_from_body_json(data)
    # sage_code = "a=1\nprint(a)"
    # sage_msg = sage_cell.execute_request(sage_code)
    # print("#############\n", sage_msg, "\n#############\n")

    sage_code = "a=1\nprint(a)"
    sage_msg = sage_cell.execute_request(sage_code)
    print("#############\n", sage_msg, "\n#############\n")
    sage_results = SageCell.get_results_from_message_json(sage_msg)
    print(sage_results)
    sage_results = json.loads(sage_results)
    print(sage_results)
    # for key, val in sage_results.items():
    #     sage_results[key] = val.replace('\n', '')
    print(sage_results)

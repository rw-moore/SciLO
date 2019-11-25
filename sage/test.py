import requests
import json, re


if __name__ == "__main__":
    '''
    fix var:
        a=1
        b=2
    script var:
        n = a+b
        A=matrix([[2,4,6],[-1,-1,-1]])
        B=matrix([[2,4,6],[-1,-1,-1]])
        C = A+B
    '''

    url = 'http://127.0.0.1:5000'
    data = {
        "fix": 'a=1\nb=2\n',
        "script": "n=a+b\nA=matrix(QQ, 2, 3, [[2,4,6],[-1,-1,-1]])\nB=matrix(QQ, 2, 3, [[2,4,6],[-1,-1,-1]])\nC=A+B\n",
        "results": ['n', 'C']
    }
    response = requests.post(url, data=json.dumps(data))
    results = json.loads(response.text)

    content = '<math inline=True>2*<var>n</var>*<var>C</var></math>'

    print(re.sub('<var.*?>(.*?)</var>', lambda x: results[x.group(1)], content))

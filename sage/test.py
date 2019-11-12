import requests, json

if __name__ == "__main__":
    url = 'http://127.0.0.1:5000'
    data = {
        "script": "a = ZZ.random_element(0,10)\nb=2\nc=a*b**2",
        "results": ["a",'b','c']
    }
    response = requests.post(url, data=json.dumps(data))
    print(response.text)

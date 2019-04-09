# POST /question/

+ Request (text/plain; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
            	"title": "ez2",
            	"background": "some sample math questions",
            	"weight": 100,
            	"responses": [	
            	]
            }

+ Response 201 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","question":{"id":2,"title":"ez2","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:45:17.523510Z","last_modify_date":"2019-04-08T23:45:17.523520Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[],"responses":[]}}


# POST /quiz/

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
                "title": "sample math quiz",
                "description": "two sample math questions",
                "weight": 100,
                "bonus": 0,
                "author": 1,
                "category": null,
                "questions": [
                    1,
                    2
                ]
            }

+ Response 201 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","quiz":{"id":1,"title":"sample math quiz","description":"two sample math questions","weight":100,"bonus":0,"create_date":"2019-04-09T00:03:41.146286Z","last_modify_date":"2019-04-09T00:03:41.146298Z","category":null,"author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"questions":[{"id":1,"title":"ez","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:44:23.942906Z","last_modify_date":"2019-04-08T23:44:23.942916Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":1,"answers":[{"content":"2","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"11","correction":false,"accuracy":0.0,"comment":"1+1 is 2"}],"name":"r1","content":"what is the answer of 1+1","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":1}]},{"id":2,"title":"ez2","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:45:17.523510Z","last_modify_date":"2019-04-08T23:45:17.523520Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}]}]}}


# PUT /quiz/1/

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
                "title": "sample math quiz",
                "description": "two sample math questions",
                "weight": 100,
                "bonus": 0,
                "author": 1,
                "category": null,
                "questions": [
                    2,
                    1
                ]
            }

+ Response 200 (application/json)

    + Headers

            Allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"id":1,"title":"sample math quiz","description":"two sample math questions","weight":100,"bonus":0,"create_date":"2019-04-09T00:03:41.146286Z","last_modify_date":"2019-04-09T00:03:41.146298Z","category":null,"author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"questions":[{"id":1,"title":"ez","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:44:23.942906Z","last_modify_date":"2019-04-08T23:44:23.942916Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":1,"answers":[{"content":"2","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"11","correction":false,"accuracy":0.0,"comment":"1+1 is 2"}],"name":"r1","content":"what is the answer of 1+1","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":1}]},{"id":2,"title":"ez2","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:45:17.523510Z","last_modify_date":"2019-04-08T23:45:17.523520Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}]}]}


# POST /response/

+ Request (text/plain; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
              "rtype": {
                "max_length": 10,
                "__response_type__": "string"
              },
              "algorithm": {
                "ignore_case": true,
                "__alg_type__": "string"
              },
              "name": "r1",
              "content": "what is the answer of 1+2",
              "question": 2,
              "answers": [
                {
                  "content": "3",
                  "correction": true,
                  "accuracy": 1.0,
                  "comment": "correct"
                },
                {
                  "content": "12",
                  "correction": false,
                  "accuracy": 0.0,
                  "comment": " 1+2 is 2 "
                }
              ]
            }

+ Response 201 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","response":{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}}


# GET /response/

+ Request

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=



+ Response 200 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","responses":[{"id":1,"answers":[{"content":"2","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"11","correction":false,"accuracy":0.0,"comment":"1+1 is 2"}],"name":"r1","content":"what is the answer of 1+1","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":1},{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}]}


# POST /response-attempt/

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
                "answers_string": "2",
                "response": "1",
                "question_attempt": 1
            }

+ Response 201 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","response-attempt":{"id":4,"grade":0.0,"answers_string":"2","response":1,"question_attempt":1}}


# GET /response-attempt/3/

+ Request

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=



+ Response 200 (application/json)

    + Headers

            Allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","response-attempt":{"id":3,"grade":0.0,"answers_string":"2","response":1,"question_attempt":1}}


# GET /question/

+ Request

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=



+ Response 200 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","questions":[{"id":1,"title":"ez","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:44:23.942906Z","last_modify_date":"2019-04-08T23:44:23.942916Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[],"responses":[{"id":1,"answers":[{"content":"2","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"11","correction":false,"accuracy":0.0,"comment":"1+1 is 2"}],"name":"r1","content":"what is the answer of 1+1","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":1}]},{"id":2,"title":"ez2","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:45:17.523510Z","last_modify_date":"2019-04-08T23:45:17.523520Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[],"responses":[{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}]}]}


# POST /quiz-attempt/

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=

    + Body

            {
                "quiz": 1,
                "author": 1
            }

+ Response 201 (application/json)

    + Headers

            Allow: GET, POST, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","quiz_attempt":1}


# GET /quiz-attempt/1/

+ Request

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=



+ Response 200 (application/json)

    + Headers

            Allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","quiz_attempt":{"id":1,"grade":0.0,"quiz":{"id":1,"title":"sample math quiz"},"author":{"id":1,"institute":null,"last_login":null,"username":"haotianzhu","first_name":"","last_name":"","email":"","is_active":true,"date_joined":"2019-04-08T22:28:03.523019Z","is_staff":true},"question_attempts":[{"id":2,"grade":0.0,"response_attempts":[],"question":{"id":2,"background":"some sample math questions","title":"ez2","responses":[{"id":2,"name":"r1","content":"what is the answer of 1+2","rtype":{"max_length":10,"__response_type__":"string"}}]}},{"id":1,"grade":0.0,"response_attempts":[{"id":3,"grade":0.0,"answers_string":"2","response":1,"question_attempt":1}],"question":{"id":1,"background":"some sample math questions","title":"ez","responses":[{"id":1,"name":"r1","content":"what is the answer of 1+1","rtype":{"max_length":10,"__response_type__":"string"}}]}}]}}


# GET /quiz/1/

+ Request

    + Headers

            Authorization: Basic aGFvdGlhbnpodToxMjM0NTY=



+ Response 200 (application/json)

    + Headers

            Allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
            X-Frame-Options: SAMEORIGIN
            Vary: Accept, Cookie

    + Body

            {"status":"success","quiz":{"id":1,"title":"sample math quiz","description":"two sample math questions","weight":100,"bonus":0,"create_date":"2019-04-09T00:03:41.146286Z","last_modify_date":"2019-04-09T00:03:41.146298Z","category":null,"author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"questions":[{"id":2,"title":"ez2","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:45:17.523510Z","last_modify_date":"2019-04-08T23:45:17.523520Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":2,"answers":[{"content":"3","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"12","correction":false,"accuracy":0.0,"comment":"1+2 is 2"}],"name":"r1","content":"what is the answer of 1+2","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":2}]},{"id":1,"title":"ez","background":"some sample math questions","weight":100,"create_date":"2019-04-08T23:44:23.942906Z","last_modify_date":"2019-04-08T23:44:23.942916Z","author":{"institute":"","last_login":null,"username":"","first_name":"","last_name":"","email":"","date_joined":null,"password":""},"category":null,"quizzes":[1],"responses":[{"id":1,"answers":[{"content":"2","correction":true,"accuracy":1.0,"comment":"correct"},{"content":"11","correction":false,"accuracy":0.0,"comment":"1+1 is 2"}],"name":"r1","content":"what is the answer of 1+1","algorithm":{"ignore_case":true,"__alg_type__":"string"},"rtype":{"max_length":10,"__response_type__":"string"},"question":1}]}]}}



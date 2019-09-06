| URL                                      | METHOD    | Authorization | Permission                   | Detail |
| ---------------------------------------- | --------- | ------------- | ---------------------------- | ------ |
| api/userprofile                          | GET       | Token         | IsAdminUser                  |        |
| api/userprofile                          | POST      |               | AllowAny                     |        |
| api/userprofile/:id                      | GET       | Token         | IsAuthenticated              |        |
| api/userprofile/:id                      | PATCH     | Token         | IsAdminUser; IsOwner         |        |
| api/userprofile/:id/question             | GET       | Token         | IsAuthenticated              |        |
| api/userprofile/:id/quiz                 | GET       | Token         | IsAuthenticated              |        |
| api/userprofile/login                    | POST      |               | AllowAny                     |        |
| api/userprofile/username/:username       | GET       | Token         | IsAuthenticated              |        |
| api/userprofile/:username/set-password   | POST      | Token         | IsAdminUser; IsOwner         |        |
| api/userprofile/:username/check-username | GET       |               | AllowAny                     |        |
| api/userprofile/:id/avata                | GET       |               | AllowAny                     |        |
| api/userprofile/:id/avata                | PUT       | Token         | IsOwner                      |        |
| api/userprofile/:id/avata                | DELETE    | Token         | IsOwner                      |        |
| api/questions                            | GET       | Token         | IsAuthenticated              |        |
| api/questions                            | POST      | Token         | IsAuthenticated              |        |
| api/questions/:id                        | POST      | Token         | IsAuthenticated              |        |
| api/questions/:id                        | PATCH/PUT | Token         | IsOwner                      |        |
| api/quiz                                 | GET       | Token         | IsAuthenticated              |        |
| api/quiz                                 | POST      | Token         | IsAuthenticated              |        |
| api/quiz/:id                             | POST      | Token         | IsAuthenticated              |        |
| api/quiz/:id                             | PATCH     | Token         | IsOwner                      |        |
| api/quiz/:id/questions                   | GET       | Token         | IsAuthenticated              |        |
| api/tags                                 | GET       | Token         | IsAuthenticated              |        |
| api/tags                                 | POST      | Token         | IsAuthenticated              |        |
| api/tags/:id                             | GET       | Token         | IsAuthenticated              |        |
| api/tags/:id                             | PATCH     | Token         | IsAuthenticated              |        |
| api/tags/:id                             | DELETE    | Token         | IsAdminUser                  |        |
| api/tags/:id/questions                   | GET       | Token         | IsAuthenticated              |        |
| api/email/send                           | GET       | Token         | IsAuthenticated              |        |
| api/email/validate                       | POST      |               | AllowAny                     |        |
| api/email/send/:username                 | GET       |               | AllowAny                     |        |
| api/quiz-attempt/:id                     | GET       | Token         | IsAuthenticated              |        |
| api/quiz-attempt/quiz/:id                | GET       | Token         | IsAuthenticated              |        |
| api/quiz-attempt/quiz/:id                | POST      | Token         | IsAuthenticated              |        |
| api/quiz-attempt/:id/submit              | POST      | Token         | IsOwner                      |        |
| api/course                               | POST      | Token         | IsAdminUser                  |        |
| api/course                               | GET       | Token         | IsAdminUser                  |        |
| api/course/:id                           | GET       | Token         | Course's groups; IsAdminUser |        |
| api/course/:id                           | DELETE    | Token         | IsAdminUser                  |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
|                                          |           |               |                              |        |
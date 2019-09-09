| URL                                      | METHOD    | Authorization | Permission   | Detail                                 |
| ---------------------------------------- | --------- | ------------- | ------------ | -------------------------------------- |
| api/userprofile                          | GET       | Token         | admin        |                                        |
| api/userprofile                          | POST      |               | any          |                                        |
| api/userprofile/:id                      | GET       | Token         | login        |                                        |
| api/userprofile/:id                      | PATCH     | Token         | admin; self  |                                        |
| api/userprofile/:id/question             | GET       | Token         | login        |                                        |
| api/userprofile/:id/quiz                 | GET       | Token         | login        |                                        |
| api/userprofile/login                    | POST      |               | any          |                                        |
| api/userprofile/username/:username       | GET       | Token         | login        |                                        |
| api/userprofile/:username/set-password   | POST      | Token         | admin; self  |                                        |
| api/userprofile/:username/check-username | GET       |               | any          |                                        |
| api/userprofile/:id/avata                | GET       |               | any          |                                        |
| api/userprofile/:id/avata                | PUT       | Token         | self         |                                        |
| api/userprofile/:id/avata                | DELETE    | Token         | self         |                                        |
| api/questions                            | GET       | Token         | login        |                                        |
| api/questions                            | POST      | Token         | login        |                                        |
| api/questions/:id                        | POST      | Token         | login        |                                        |
| api/questions/:id                        | PATCH/PUT | Token         | self         |                                        |
| api/quiz                                 | GET       | Token         | login        |                                        |
| api/quiz                                 | POST      | Token         | login        |                                        |
| api/quiz/:id                             | POST      | Token         | login        |                                        |
| api/quiz/:id                             | PATCH     | Token         | self         |                                        |
| api/quiz/:id/questions                   | GET       | Token         | login        |                                        |
| api/tags                                 | GET       | Token         | login        |                                        |
| api/tags                                 | POST      | Token         | login        |                                        |
| api/tags/:id                             | GET       | Token         | login        |                                        |
| api/tags/:id                             | PATCH     | Token         | login        |                                        |
| api/tags/:id                             | DELETE    | Token         | admin        |                                        |
| api/tags/:id/questions                   | GET       | Token         | login        |                                        |
| api/email/send                           | GET       | Token         | login        |                                        |
| api/email/validate                       | POST      |               | any          |                                        |
| api/email/send/:username                 | GET       |               | any          |                                        |
| api/quiz-attempt/:id                     | GET       | Token         | login        |                                        |
| api/quiz-attempt/quiz/:id                | GET       | Token         | login        |                                        |
| api/quiz-attempt/quiz/:id                | POST      | Token         | login        |                                        |
| api/quiz-attempt/:id/submit              | POST      | Token         | self         |                                        |
| api/course                               | POST      | Token         | admin        |                                        |
| api/course                               | GET       | Token         | admin;login  | [get course](#get-course)              |
| api/course/:id                           | GET       | Token         | group; admin | [get courses by id](#get-course-by-id) |
| api/course/:id                           | DELETE    | Token         | admin        |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |
|                                          |           |               |              |                                        |







# get course by id 

- User has to be in at least one of course's groups



# get course

- Case1: user is admin/staff, return all courses in database
- Case2: user is professor/student, return all courses that this user can access 


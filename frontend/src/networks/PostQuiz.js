import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PostQuiz(quiz, courseId, token) {
    return axios
        .post(API.domain+":"+ API.port + "/api/"+API.endpoints.course.address+"/"+courseId+"/"+API.endpoints.quiz.address,
            quiz, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Token ${token}`
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}


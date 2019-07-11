import axios from "axios";
import API from "./Endpoints";

export default function PostQuiz(quiz) {
    return axios
        .post(API.domain+":"+ API.port + "/api/"+API.endpoints.quiz.address,
            quiz, {
                auth: {username: "tianqiwang", password: "123456"},
                headers: {
                    "Content-Type": "application/json"
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(error => console.log(error));
}


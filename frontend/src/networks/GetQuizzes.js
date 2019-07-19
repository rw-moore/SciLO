import axios from "axios";
import API from "./Endpoints";

export default function GetQuizzes(params={}) {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.quiz.address,
            {
                auth: {username: "tianqiwang", password: "123456"},
                headers: {
                    "Content-Type": "application/json"
                },
                params: params
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(error => console.log(error));
}
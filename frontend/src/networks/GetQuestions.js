import axios from "axios";
import API from "./Endpoints";

export default function GetQuestions() {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.questions.address,
            {
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
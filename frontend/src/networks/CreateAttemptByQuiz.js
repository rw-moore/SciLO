import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function CreateAttemptListByQuiz(id, token, params={}) {
    return axios
        .post(API.domain+"/api/quiz/"+id+"/"+API.endpoints.attempt.address, {},
            {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Token ${token}`
                },
                params: params
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}
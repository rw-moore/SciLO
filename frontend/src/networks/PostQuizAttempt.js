import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PostQuizAttempt(id, data, token, params={}) {
    return axios
        .post(API.domain+":"+ API.port + "/api/"+API.endpoints.attempt.address+"/"+id, data,
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
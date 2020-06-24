import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function HideQuiz(id, hidden, token, params={}) {
    return axios
        .patch(API.domain+":"+ API.port + "/api/"+API.endpoints.quiz.address+"/"+id, {is_hidden: hidden},
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
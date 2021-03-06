import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PutQuestion(id, data, token, params={}) {
    return axios
        .put(API.domain+":"+ API.port + "/api/"+API.endpoints.questions.address+"/"+id, data,
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
import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function SendEmailCaptcha(token, params={}) {
    return axios
        .get(API.domain+ "/api/"+API.endpoints.email.address+"/send",
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
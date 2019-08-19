import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function ResetPasswordCaptcha(username, params={}) {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.email.address+"/send/"+username,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                params: params
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}
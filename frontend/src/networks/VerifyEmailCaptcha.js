import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function VerifyEmailCaptcha(data) {
    return axios
        .post(API.domain+ "/api/"+API.endpoints.email.address+"/validate",
            data, {
                headers: {
                    "Content-Type": "application/json",
                    // "authorization": `Token ${token}`
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}


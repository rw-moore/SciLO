import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function ResetPassword(username, data, token) {
    return axios
        .post(API.domain+ "/api/"+API.endpoints.user.address+"/"+username+"/set-password",
            data, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Token ${token}`
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}


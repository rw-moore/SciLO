import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function UserLogin(user) {
    return axios
        .post(API.domain+":"+ API.port + "/api/"+API.endpoints.user.address+"/login",
            user, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}


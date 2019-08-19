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
            if (response.data.token) {
                window.sessionStorage.setItem("token", response.data.token);
                window.sessionStorage.setItem("user", JSON.stringify(response.data.user));
            }
            return response;
        })
        .catch((error) => {
            window.sessionStorage.removeItem("token");
            window.sessionStorage.removeItem("user");
            return ErrorHandler(error);
        });
}


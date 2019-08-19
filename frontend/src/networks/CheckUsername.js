import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function CheckUsername(user, cb) {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.user.address+"/"+user+"/check-username",
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        .then(response => {
            console.log(response);
            if (response.data.exists) {
                cb("This username has been used.");
            }
            else {
                cb();
            }
        })
        .catch((error) => {
            cb(ErrorHandler(error).data);
        });
}
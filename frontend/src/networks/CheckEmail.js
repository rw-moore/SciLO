import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function CheckEmail(email, cb) {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.user.address+"/"+email+"/check-email",
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        .then(response => {
            console.log(response);
            if (response.data.exists) {
                cb("This email has been used.");
            }
            else {
                cb();
            }
        })
        .catch((error) => {
            cb(ErrorHandler(error).data);
        });
}
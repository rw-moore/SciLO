import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function DeleteAvatar(id, token) {
    return axios
        .delete(API.domain+ "/api/"+API.endpoints.user.address+"/"+id+"/avatar",
            {
                headers: {
                    "authorization": `Token ${token}`
                }
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}
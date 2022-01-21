import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function GetUserById(id, token, params={}) {
    return axios
        .get(API.domain+ "/api/"+API.endpoints.user.address+"/"+id,
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
import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PutAvatar(id, avatar, token) {
    const form_data = new FormData();

    form_data.append("avatar", avatar);
    console.log(form_data);

    return axios
        .put(API.domain+":"+ API.port + "/api/"+API.endpoints.user.address+"/"+id+"/avatar",
            form_data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "authorization": `Token ${token}`
                },

            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}
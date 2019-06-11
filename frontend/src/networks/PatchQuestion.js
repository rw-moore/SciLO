import axios from "axios";
import API from "./Endpoints";

export default function PatchQuestion(id, data, params={}) {
    return axios
        .patch(API.domain+":"+ API.port + "/api/"+API.endpoints.questions.address+"/"+id, data,
            {
                auth: {username: "tianqiwang", password: "123456"},
                headers: {
                    "Content-Type": "application/json"
                },
                params: params
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(error => console.log(error));
}
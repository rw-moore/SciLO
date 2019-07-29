import axios from "axios";
import API from "./Endpoints";

export default function DeleteQuestion(id) {
    return axios
        .delete(API.domain+":"+ API.port + "/api/"+API.endpoints.quiz.address+"/"+id,
            {
                auth: {username: "tianqiwang", password: "123456"}
            })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(error => console.log(error));
}
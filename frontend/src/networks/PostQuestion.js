import axios from "axios";
import API from "./Endpoints";

export default function PostQuestion(question) {
    axios
        .post(API.domain+"/"+API.endpoints.questions, question)
        .then(response => {
            return response;
        })
        .catch(error => console.log(error));
}


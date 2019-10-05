import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function GetQuizById(id, courseId, token, params={}) {
    return axios
        .get(API.domain+":"+ API.port + "/api/"+API.endpoints.course.address+"/"+courseId+"/"+API.endpoints.quiz.address+"/"+id,
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
import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function DeleteQuiz(id, courseId, token) {
    return axios
        .delete(API.domain+":"+ API.port + "/api/"+API.endpoints.course.address+"/"+courseId+"/"+API.endpoints.quiz.address+"/"+id,
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
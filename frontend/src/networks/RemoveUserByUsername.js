import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function RemoveUserByUsername(courseId, group, username, token) {
    return axios
        .delete(API.domain+":"+ API.port + "/api/"+API.endpoints.course.address+`/${courseId}/group/${group}/users?username=1`,
        {
            data: {users:[username]},
            headers: {
                "Content-Type": "application/json",
                "authorization": `Token ${token}`
            }
        })
        .then(response => {
            console.log(response);
            return response;
        })
        .catch(ErrorHandler);
}


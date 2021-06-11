import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PutQuestionImages(id, images, token) {
    console.log('put images', images);
    const form_data = new FormData();
    let numFiles = 0;
    images.forEach(file=>{
        if (file.originFileObj) {
            form_data.append("files[]", file.originFileObj);
            console.log(numFiles);
            form_data.append("order[]", "file"+numFiles);
            numFiles++;
        } else {
            form_data.append("order[]", file.id);
        }
    });
    return axios
        .put(API.domain+":"+ API.port + "/api/"+API.endpoints.questions.address+"/"+id+"/images",
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
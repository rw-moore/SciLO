import axios from "axios";
import API from "./Endpoints";
import ErrorHandler from "./ErrorHandler";

export default function PutQuestionImages(id, images, token) {
    // console.log('put images', images);
    const form_data = new FormData();
    let numFiles = 0;
    let numBlobs = 0;
    images.forEach(file=>{
        if (file.originFileObj) {
            form_data.append("files[]", file.originFileObj);
            form_data.append("order[]", "file"+numFiles);
            numFiles++;
        } else if (file.id) {
            form_data.append("order[]", file.id);
        } else {
            form_data.append("blobs[]", file.url);
            form_data.append("order[]", "blob"+numBlobs);
            numBlobs++;
        }
    });
    return axios
        .put(API.domain+ "/api/"+API.endpoints.questions.address+"/"+id+"/images",
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
// https://3x.ant.design/components/upload/
import {message} from "antd";
import PostQuestion from "../networks/PostQuestion";
import PutQuestionImages from "../networks/PutQuestionImages";

function upload(question, token) {
    const images = question.question_image;
        images.forEach(image=>{
            image.id = undefined;
        })
        question.question_image = [];
        return PostQuestion(question, token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see browser console for more details.");
                console.error(data);
                return Promise.reject();
            }
            return data;
         }).then((data)=> {
            // console.log('put question', data);
            return PutQuestionImages(data.data.question.id, images, token).then(image_data=> {
                if (!image_data || image_data.status !== 200) {
                    message.error("Image submission failed, see browser console for more details.");
                    console.error(image_data);
                } else {
                    message.success("Question was saved successfully.");
                }
            })
        });
}
export default function UploadQuestions(file, fileList, token, cb, course=undefined) {
    const fileReader = new FileReader();
    fileReader.onload = (() => {
        return (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // console.log("upload",data)

                const promises = [];
                data.questions.forEach((question)=>{
                    question.course=course;
                    question.id=undefined;
                    question.owner=undefined;
                    question.quizzes=undefined;
                    question.responses.forEach((response)=>{
                        response.question=undefined;
                    });
                    question.tags.forEach((tag)=>{
                        tag.id=undefined;
                    });
                    promises.push(upload(question, token));
                })
                Promise.all(promises).then(function() {
                    cb();
                }, function(err) {
                    console.error('all promise', err);
                    // error occurred
                });
            } catch (ex) {
                message.error('Exception when trying to parse json: ' + ex);
            }
        }
    })(file);
    fileReader.readAsText(file);
    return false
}
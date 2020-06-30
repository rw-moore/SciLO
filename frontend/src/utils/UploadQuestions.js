// https://3x.ant.design/components/upload/
import {message} from "antd";

export default function UploadQuestions(file, fileList, method, cb) {
    const fileReader = new FileReader();
    fileReader.onload = (() => {
        return (e) => {
            try {
                const data = JSON.parse(e.target.result);
                console.log("upload",data)

                const promises = [];
                data.questions.forEach((question)=>{
                    question.course=undefined;
                    question.id=undefined;
                    question.owner=undefined;
                    question.quizzes=undefined;
                    question.responses.forEach((response)=>{
                        response.question=undefined;
                    });
                    question.tags.forEach((tag)=>{
                        tag.id=undefined;
                    });
                    promises.push(method(question));
                })
                Promise.all(promises).then(function() {
                    cb();
                }, function(err) {
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
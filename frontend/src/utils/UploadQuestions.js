// https://3x.ant.design/components/upload/
import {message} from "antd";
import PostQuestion from "../networks/PostQuestion";

export default function UploadQuestions(file, fileList, method, cb) {
    const fileReader = new FileReader();
    fileReader.onload = (() => {
        return (e) => {
            try {
                const data = JSON.parse(e.target.result);
                console.log("upload",data)
                data.questions.forEach((question)=>{
                    question.course=undefined;
                    question.id=undefined;
                    question.author=undefined;
                    question.quizzes=undefined;
                    method(question);
                })
                cb();
            } catch (ex) {
                message.error('Exception when trying to parse json: ' + ex);
            }
        }
    })(file);
    fileReader.readAsText(file);
    return false
}
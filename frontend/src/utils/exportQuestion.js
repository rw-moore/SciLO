import SaveAs from "./SaveAs";
import moment from "moment";

function toDataUrl(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        let reader = new FileReader();
        reader.onloadend = function() {
            // console.log('result', reader.result);
            callback(reader.result);
        }
        // console.log('response', xhr.response);
        reader.readAsDataURL(xhr.response);
    };
    // console.log('xhr', url);
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}
function toDataUrlAsync(url) {
    return new Promise(function(resolve, reject){
        toDataUrl(url, resolve);
    })
}
export function sanitizeQuestions(questions, cb) {
    const promises = [];
    questions.forEach(question => {
        question.owner = undefined;
        question.question_image.forEach((image,i)=> {
            if (image.url) {
                // console.log(image.url);
                promises.push(toDataUrlAsync(image.url).then(myBase64=> {
                    // console.log(image.url, myBase64);
                    image.url = myBase64;
                }));
            }
        });
    });
    Promise.all(promises).then(()=> {
        cb(questions);
    })
}
export default function ExportQuestion(questions) {
    let output = {};
    output.version="0.1.1";
    output.timestamp=moment.now();
    sanitizeQuestions(questions, (questions)=> {
        output.questions = questions;
        SaveAs(output, "questions.json", "text/plain");
    });
}
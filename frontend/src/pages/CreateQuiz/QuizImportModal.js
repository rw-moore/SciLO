import {Button, Form, message, Modal, Radio, Upload} from "antd";
import React, {useState} from "react";
import PostQuiz from "../../networks/PostQuiz";
import PostQuestion from "../../networks/PostQuestion";
import UploadQuestions from "../../utils/UploadQuestions";

export default function QuizImportModal(props) {
    const [visible, setVisible] = useState(false);
    const [method, setMethod] = useState(1);
    const [quizzes, setQuizzes] = useState({});

    // uid is file-id
    const addQuiz = (uid, quiz) => {
        const _quizzes = quizzes;
        _quizzes[uid]= quiz;
        setQuizzes(_quizzes);
    }

    const removeQuiz = (uid) => {
        const _quizzes = quizzes;
        delete _quizzes[uid];
        setQuizzes(_quizzes);
    }

    let explain;
    switch (method) {
        case 0:
            explain = "Don't import any questions, only using the exact ids from quiz.";
            break
        case 1:
            explain = "Matched questions in the database with same id & title will not be imported.";
            break
        case 2:
            explain = "Always import and upload question data from the file.";
            break
        default:
            explain = "";
            break
    }

    const loadFile = (file, fileList) => {
        const fileReader = new FileReader();
        fileReader.onload = (() => {
            return (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    addQuiz(file.uid, data);
                } catch (ex) {
                    message.error('Exception when trying to parse json: ' + ex);
                }
            }
        })(file);
        fileReader.readAsText(file);

        return false  // must be false to upload manually
    }

    const removeFile = (file) => {
        removeQuiz(file.uid)
        return true
    }

    const onOk = () => {
        Object.values(quizzes).forEach(quiz=>{
            quiz = quiz.quiz;

            if (method === 2) {
                const promises = [];
                quiz.questions.forEach((question)=>{
                    question.question.course=props.course;
                    question.question.id=undefined;
                    question.question.owner=undefined;
                    question.question.quizzes=undefined;
                    promises.push(postQuestion(question.question).then(data=>{question.question.id = data.data.question.id}));
                })
                Promise.all(promises).then(function() {
                    quiz.questions.forEach(question => {
                        question.id = question.question.id;
                        question.question = undefined;
                    })
                    console.log(quiz)
                    return postQuiz(quiz);
                }, function(err) {
                    // error occurred
                });
            }
        })
    }

   const onCancel = () => {
        setMethod(1);
        setQuizzes({});
        setVisible(false);
    }

    const postQuiz = (values) => PostQuiz(JSON.stringify(values), props.token).then(data => {
        if (!data || data.status !== 200) {
            message.error("Submit failed, see console for more details.");
            console.error(data);
        } else {
            return true
        }
    });

    const postQuestion = (question) => {
        return PostQuestion(JSON.stringify(question), props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see console for more details.");
                console.error(data);
            }
            else {
                return data
            }
        });
    }

    return (
        <span>
            <Button icon={"upload"} onClick={()=>setVisible(true)}>
                Import
            </Button>

            <Modal
                title="Import quiz"
                visible={visible}
                onOk={onOk}
                onCancel={onCancel}
                destroyOnClose={true}
            >
                <Form.Item label="Import and Copy questions" extra={explain}>
                    <Radio.Group value={method} onChange={e=>setMethod(e.target.value)}>
                        <Radio.Button value={0}><span style={{color:"green"}}>No</span></Radio.Button>
                        <Radio.Button value={1}><span style={{color:"orange"}}>Auto</span></Radio.Button>
                        <Radio.Button value={2}><span style={{color: "red"}}>Yes</span></Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Upload beforeUpload={loadFile} accept=".json" multiple={true} onRemove={removeFile}>
                    <Button icon={"upload"}>Select Files</Button>
                </Upload>
            </Modal>
        </span>
    )
}
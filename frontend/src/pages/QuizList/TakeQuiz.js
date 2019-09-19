import React from 'react';
import {Alert, Descriptions, Divider, Form, message, Table, Typography} from "antd";
import GetQuizAttempt from "../../networks/GetQuizAttempt";
import questions from "../../mocks/Questions";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
import moment from "moment";
import QuestionScoreTable from "../../components/QuizCard/QuestionScoreTable";
import QuestionFrame from "../../components/QuestionPreviews/QuestionFrame";
import PostQuizAttempt from "../../networks/PostQuizAttempt";

export default class TakeQuiz extends React.Component {
    state = {
        buffer: []
    };

    lastBuffer = [];

    writeToBuffer = (questionId, responseId, answer) => {
        let buffer = this.state.buffer;
        const questionIndex = buffer.findIndex((question) => questionId === question.id);
        if (questionIndex === -1) {
            buffer.push({id: questionId, responses: [{id: responseId, answer: answer}]});
        } else {
            const responseIndex = buffer[questionIndex].responses.findIndex((response) => responseId === response.id);
            if (responseIndex === -1) {
                buffer[questionIndex].responses.push({id: responseId, answer: answer});
            } else {
                buffer[questionIndex].responses[responseIndex].answer = answer;
            }

        }

        this.setState({
            buffer: buffer
        })
    };

    getSavedValues = (questions) => {
        let buffer = [];
        questions.forEach(question=>{
            let responses = [];
            question.responses.forEach(response => {
                for (const attempt in response.tries) {
                    if (response.tries[attempt][0]!==null && response.tries[attempt][1]===null) {
                        responses.push({id: response.id, answer: response.tries[attempt][0]})
                    }
                }
            });
            if (responses.length) {
                buffer.push({id: question.id, responses: responses})
            }
        });
        return buffer
    };

    save = (auto=false) => {
        const submission =  {
            submit: false,
            questions: this.state.buffer
        };

        console.log(submission);

        PostQuizAttempt(this.props.id, submission,this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot submit / save quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                console.log("after", data);
                this.setState({
                    quiz: data.data.quiz,
                    loading: false,
                });
            }
        });
    };

    submit = () => {
        // prohibit empty answer
        let emptyCells = {};
        this.state.buffer.forEach(question => {

            question.responses.forEach(response => {
                if (!response.answer) {
                    if (emptyCells[question.id]) {
                        emptyCells[question.id] = [...emptyCells[question.id], response.id]
                    }
                    else {
                        emptyCells[question.id] = [response.id]
                    }
                }


            })
        });

        if (Object.keys(emptyCells).length > 0) {
            message.error("Cannot submit empty answers!");
            return false
        }

        // prohibit exceptional duplicate submission
        if (this.lastBuffer === this.state.buffer) {
            return false
        }
        this.lastBuffer = this.state.buffer;

        // parse submission data
        const submission =  {
            submit: true,
            questions: this.state.buffer
        };

        console.log(submission);

        PostQuizAttempt(this.props.id, submission,this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot submit / save quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                console.log("after", data);
                this.setState({
                    loading: false,
                    quiz: data.data.quiz,
                    buffer: []
                });
            }
        });
    };

    componentDidMount() {
        this.fetch(this.props.id);

        // auto-save every 60s
        // setInterval(()=>{
        //     this.save(true);
        // }, 60000)
    }

    fetch = (params = {}) => {
        this.setState({loading: true});
        GetQuizAttempt(this.props.id, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                this.setState({
                    loading: false,
                    quiz: data.data.quiz,
                    buffer: this.getSavedValues(data.data.quiz.questions)
                });
            }
        });
    };



    render() {
        return (
            <div className={"TakeQuiz"} style={{padding: "0px 64px 64px 64px"}} >
                {this.state.quiz && <>
                    <Typography.Title level={2}>
                        {this.state.quiz.title}
                    </Typography.Title>
                    <Descriptions
                        title="Quiz Info"
                        //bordered
                        column={{ xxl: 3, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                    >
                        <Descriptions.Item label="Author">{this.state.quiz.author}</Descriptions.Item>
                        <Descriptions.Item label="Status">{this.state.quiz.status}</Descriptions.Item>
                        <Descriptions.Item label="Grade">{this.state.quiz.grade}</Descriptions.Item>
                        <Descriptions.Item label="Bonus">{this.state.quiz.bonus}</Descriptions.Item>
                        <Descriptions.Item label="Start">{moment.utc(this.state.quiz.start_end_time[0]).format("llll")}</Descriptions.Item>
                        <Descriptions.Item label="End">{moment.utc(this.state.quiz.start_end_time[1]).format("llll")}</Descriptions.Item>
                        <Descriptions.Item label="Last Modified" span={3}>{moment.utc(this.state.quiz.last_modified_date).format("llll")}</Descriptions.Item>

                        <Descriptions.Item label="Questions" span={3}>
                            <br/>
                            <QuestionScoreTable questions={this.state.quiz.questions}/>
                        </Descriptions.Item>
                    </Descriptions>
                </>}
                <Divider/>
                <Form>
                    {this.state.quiz && this.state.quiz.questions && this.state.quiz.questions.map((question, index) => (
                        <span key={question.id} style={{margin: 12}}>
                            <QuestionFrame
                                loading={this.state.loading}
                                question={question}
                                index={index}
                                buffer={(responseId, answer) => this.writeToBuffer(question.id, responseId, answer)}
                                save={this.save}
                                submit={this.submit}
                            />
                        </span>
                    ))}
                </Form>
            </div>
        )
    }
}
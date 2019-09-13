import React from 'react';
import {Alert, Descriptions, Divider, message, Table, Typography} from "antd";
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
                    loading: false,
                    buffer: []
                });
            }
        });
    };

    submit = () => {

    };

    componentDidMount() {
        this.fetch(this.props.id)
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
                {this.state.quiz && this.state.quiz.questions && this.state.quiz.questions.map((question, index) => (
                    <span key={question.id} style={{margin: 12}}>
                        <QuestionFrame
                            question={question}
                            index={index}
                            buffer={(responseId, answer) => this.writeToBuffer(question.id, responseId, answer)}
                            save={this.save}
                        />
                    </span>
                ))}
            </div>
        )
    }
}
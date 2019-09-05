import React from 'react';
import {Alert, Descriptions, Divider, message, Table, Typography} from "antd";
import GetQuizAttempt from "../../networks/GetQuizAttempt";
import questions from "../../mocks/Questions";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";
import moment from "moment";
import QuestionScoreTable from "../../components/QuizCard/QuestionScoreTable";

export default class TakeQuiz extends React.Component {
    state = {};

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
                {this.state.quiz && this.state.quiz.questions && this.state.quiz.questions.map(question => (
                    <span key={question.id} style={{margin: 12}}><BasicFrame question={question}/></span>
                ))}
            </div>
        )
    }
}
import React from "react";
import {Modal, Table, Descriptions, Card, Tag, Typography, Row, Col, Divider} from "antd";
import moment from "../../pages/QuizList/TakeQuiz";
import QuestionScoreTable from "../QuizCard/QuestionScoreTable";
import theme from "../../config/theme";

const DescriptionItem = ({ title, content }) => (
    <div
        style={{
            marginBottom: 4,
            color: 'rgba(0,0,0,0.65)',
        }}
    >
        <Typography.Text
            strong
            style={{
                marginRight: 8,
                display: 'inline-block',
                color: theme['@primary-color'],
            }}
        >
            {title}:
        </Typography.Text>
        {content}
    </div>
);

export default class QuestionStatsCollapse extends React.Component {

    constructor(props) {
        super(props);
    }

    getColor = (attempt) => {
        if (attempt[1] !== null) {
            return attempt[2] ? "green" : "red"
        }
        else {
            return "blue"
        }
    }

    showStats = () => {

        Modal.info({
            title: this.props.children,
            content: (
                <div>

                    <DescriptionItem title="Total Grade" content={`${Math.round(this.props.question.grade * this.props.question.mark / 100)} / ${this.props.question.mark}`}/>

                    {this.props.question.responses.map((response, index) => {

                        return (
                            <Card
                                style={{marginBottom: 12}}
                                bordered={true}
                                type={"inner"}
                                title={<Typography.Text strong>{index+1}</Typography.Text>}
                                size={"small"}
                                key={index}
                            >
                                <Row gutter={16}>
                                    <Col xs={{span: 24}} md={{span: 12}}>
                                        <DescriptionItem title="Grade Policy" content={
                                            <div style={{marginLeft: 12}}>
                                                <DescriptionItem title="Mark" content={response.mark}/>

                                                {!!(response.grade_policy.penalty_per_try) &&
                                                <DescriptionItem title="Penalty Per Try"
                                                                 content={response.grade_policy.penalty_per_try}/>}
                                                {!!(response.grade_policy.free_tries) &&
                                                <DescriptionItem title="Free Tries"
                                                                 content={response.grade_policy.free_tries}/>}
                                                {!!(response.grade_policy.policy) &&
                                                <DescriptionItem title="Policy"
                                                                 content={response.grade_policy.policy}/>}
                                            </div>
                                        }
                                     />
                                    </Col>
                                    <Col xs={{span: 24}} md={{span: 12}}>
                                        <DescriptionItem title="Attempts" content={`${response.left_tries} / ${response.tries.length}`}/>
                                        {response.tries.map((attempt, index) => {
                                            if (attempt[0]) {
                                                return (
                                                    <div>
                                                        <Tag color={this.getColor(attempt)} key={index}>{index+1}</Tag>
                                                        <Typography.Text>{attempt[0]}</Typography.Text>
                                                        <Divider type={"vertical"}/>
                                                        <Typography.Text>Grade: {attempt[1]}</Typography.Text>
                                                    </div>
                                                )
                                            }
                                            else {
                                                return <></>
                                            }
                                        })}
                                    </Col>
                                </Row>
                            </Card>
                        )
                    })}
                </div>
            ),
            width: "70%",
            onOk() {},
        });
    }

    render() {
        return(
            <span onClick={this.showStats} style={{position: "relative", top: 4}}>{this.props.children}</span>
        )
    }
}
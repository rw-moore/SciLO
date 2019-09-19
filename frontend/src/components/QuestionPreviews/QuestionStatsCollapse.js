import React from "react";
import {Modal, Table, Descriptions, Card, Tag} from "antd";
import moment from "../../pages/QuizList/TakeQuiz";
import QuestionScoreTable from "../QuizCard/QuestionScoreTable";
import theme from "../../config/theme";

const DescriptionItem = ({ title, content }) => (
    <div
        style={{
            fontSize: 14,
            lineHeight: '8px',
            marginBottom: 4,
            color: 'rgba(0,0,0,0.65)',
        }}
    >
        <p
            style={{
                marginRight: 8,
                display: 'inline-block',
                color: theme['@primary-color'],
            }}
        >
            {title}:
        </p>
        {content}
    </div>
);

export default class QuestionStatsCollapse extends React.Component {

    constructor(props) {
        super(props);
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
                                bordered={false}
                                title={index+1}
                                size={"small"}
                            >
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
                                <DescriptionItem title="Tries left" content={`${response.left_tries} / ${response.tries.length}`}/>
                                {response.tries.map((attempt, index) => {
                                    if (attempt[0]) {
                                        return (
                                            <div style={{color: attempt[2] ? "green" : "red"}}>
                                                {`${index}. Answer: ${attempt[0]} Grade: ${attempt[1]}`}
                                            </div>
                                        )
                                    }
                                    else {
                                        return <></>
                                    }
                                })}
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
            <span onClick={this.showStats}>{this.props.children}</span>
        )
    }
}
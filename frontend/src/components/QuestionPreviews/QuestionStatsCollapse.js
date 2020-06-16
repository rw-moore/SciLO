import React from "react";
import {Card, Col, Divider, Modal, Popover, Row, Tag, Typography} from "antd";
import theme from "../../config/theme";
import XmlRender from "../Editor/XmlRender";

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

    getColor = (attempt) => {
        if (attempt[1] !== null) {
            return attempt[2] ? "green" : "red"
        }
        else {
            return "blue"
        }
    };

    renderMCText = (answer, choices) => {
        if (!answer) {
            return
        }

        if (typeof answer === "string") {
            const match = choices.filter((choice)=>(choice.id===answer))
            if (match)
                return match[0].text
        }
        else {
            return choices.filter((choice)=>(choice.id in answer)).map((choice)=>choice.text)
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
                                                    <div key={index}>
                                                        <Tag color={this.getColor(attempt)} key={index}>{index+1}</Tag>
                                                        <XmlRender inline style={{border: undefined}}>{response.type.name==="multiple"?this.renderMCText(attempt[0], response.choices):attempt[0]}</XmlRender>
                                                        <Divider type={"vertical"}/>
                                                        <Typography.Text>Grade: {attempt[1]}</Typography.Text>
                                                        {attempt[3] && <>
                                                            <Divider type={"vertical"}/>
                                                            <Popover content={<pre>{attempt[3].join("\n")}</pre>} title="Title">
                                                                <Tag color={"orange"}>Feedback</Tag>
                                                            </Popover>
                                                        </>}
                                                    </div>
                                                )
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
    };

    render() {
        return(
            <span onClick={this.showStats} style={{position: "relative", top: 4}}>{this.props.children}</span>
        )
    }
}
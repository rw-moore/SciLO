import React from "react";
import {Card, Col, Divider, Modal, Popover, Row, Tag, Typography} from "antd";
import theme from "../../config/theme";
// import XmlRender from "../Editor/XmlRender";
// import PrintObject from "../PrintObject";

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

    renderInputs = (inputs) => {
        return Object.entries(inputs).map(item => {
            for (var i=0; i<this.props.question.responses.length; i++){
                if (this.props.question.responses[i].identifier === item[0]) {
                    if (this.props.question.responses[i].type.name !== "multiple") {
                        return (
                            <div key={item[0]}>
                                {item[0]}: {<span>{item[1]}</span>}
                            </div>
                        )
                    } else {
                        return (
                            <div key={item[0]}>
                                {item[0]}: {<span>{this.renderMCText(item[1], this.props.question.responses[i].answers)}</span>}
                            </div>
                        )
                    }
                }
            }
            return <></>
        })
    }

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
                    <DescriptionItem title="Total Grade" content={`${Number(this.props.question.grade*this.props.question.mark/100).toPrecision(2)||0} / ${this.props.question.mark}`}/>
                    <Card
                        style={{marginBottom: 12}}
                        bordered={true}
                        type={"inner"}
                        title={<Typography.Text strong>{this.props.question.id}</Typography.Text>}
                        size={"small"}
                        key={this.props.question.id}
                    >
                        <Row gutter={16}>
                            <Col xs={{span:24}} md={{span:12}}>
                                <DescriptionItem title="Grade Policy" content={
                                    <div style={{marginLeft: 12}}>
                                        <DescriptionItem title="Mark" content={this.props.question.mark}/>

                                        {(this.props.question.grade_policy.penalty_per_try!==undefined) &&
                                        <DescriptionItem title="Penalty Per Try"
                                                            content={this.props.question.grade_policy.penalty_per_try}/>}
                                        {(this.props.question.grade_policy.free_tries!==undefined) &&
                                        <DescriptionItem title="Free Tries"
                                                            content={this.props.question.grade_policy.free_tries}/>}
                                        {(this.props.question.grade_policy.policy!==undefined) &&
                                        <DescriptionItem title="Policy"
                                                            content={this.props.question.grade_policy.policy}/>}
                                    </div>
                                }/>
                            </Col>
                            <Col xs={{span: 24}} md={{span: 12}}>
                                <DescriptionItem title="Attempts" content={`${this.props.question.left_tries || 0} / ${this.props.question.tries?this.props.question.tries.length: this.props.question.grade_policy.max_tries}`}/>
                                {this.props.question.tries && this.props.question.tries.map((attempt, index) => {
                                    if (attempt[0]) {
                                        return (
                                            <div key={index}>
                                                <Tag color={this.getColor(attempt)} key={index}>{index+1}</Tag>
                                                {this.renderInputs(attempt[0])}
                                                <Divider type={"vertical"}/>
                                                <Typography.Text>Grade: {Number(attempt[1]).toPrecision(2)}</Typography.Text>
                                                {!this.props.hide_feedback && attempt[2] && <>
                                                    <Divider type={"vertical"}/>
                                                    <Popover content={<pre>{this.props.question.feedback.end.join("\n")}</pre>} title="Feedback">
                                                        <Tag color={"orange"}>Feedback</Tag>
                                                    </Popover>
                                                </>}
                                            </div>
                                        )
                                    }
                                    return <div></div>
                                })}
                            </Col>
                        </Row>
                    </Card>
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
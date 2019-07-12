import React from 'react';
import {Card, Icon} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";

export default class OngoingQuiz extends React.Component {

    render() {
        const { Meta } = Card;

        return (
            <Card
                style={{}}
                actions={[<Icon type="bar-chart" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
            >
                <Meta
                    avatar={<UserIcon />}
                    title={this.props.title}
                    description={`Submit: ${Math.floor(Math.random()*36)}/36`}
                />
                <QuizTimeline endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        )
    }
}
import React from 'react';
import {Card, Icon, Tooltip} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import moment from 'moment';

export default class InComingQuiz extends React.Component {

    displayTimeLeft = () => {
        return (
            <Tooltip title={this.props.startTime?this.props.startTime.format('llll'):undefined}>
                {"Start: "+this.calculateTimeLeft().humanize(true)}
            </Tooltip>
        )
    };

    calculateTimeLeft = () => {
        return moment.duration(moment(this.props.startTime).diff(moment()));
    };

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
                    description={this.displayTimeLeft()}
                />
                <QuizTimeline noLine={false} endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        )
    }
}
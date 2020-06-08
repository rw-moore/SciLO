import React from 'react';
import {Card, Icon, Tag, Tooltip} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import moment from 'moment';
import {Link} from "react-router-dom";
import RandomColorBySeed from "../../utils/RandomColorBySeed";
import Admin from "../../contexts/Admin";

/**
 * future quiz in quiz card view
 */
export default class InComingQuiz extends React.Component {

    /* display how much time left */
    displayTimeLeft = () => {
        return (
            <Tooltip title={this.props.startTime?this.props.startTime.format('llll'):undefined}>
                {"Start: "+this.calculateTimeLeft().humanize(true)}
            </Tooltip>
        )
    };

    /* calculate the remaining time */
    calculateTimeLeft = () => {
        return moment.duration(moment(this.props.startTime).diff(moment()));
    };

    render() {
        const { Meta } = Card;

        return (
            <Card
                style={{}}
                actions={[<Admin><Link to={`Quiz/edit/${this.props.id}`}><Icon type="edit" /></Link></Admin>]}
            >
                <Meta
                    avatar={<UserIcon />}
                    title={
                        <span>
                            {this.props.title}
                            {(this.props.course) && <Tag style={{float: "right"}} color={RandomColorBySeed(this.props.course.id).bg}>
                                <span style={{color: RandomColorBySeed(this.props.course.id).fg}}>{this.props.course.shortname}</span>
                            </Tag>}
                        </span>
                    }
                    description={this.displayTimeLeft()}
                />
                <QuizTimeline noLine={false} endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        )
    }
}
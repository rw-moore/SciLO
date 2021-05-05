import React from 'react';
import { BarChartOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Button, Card, Tag, Tooltip } from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import moment from 'moment';
import {Link} from "react-router-dom";
import RandomColorBySeed from "../../utils/RandomColorBySeed";
// import Admin from "../../contexts/Admin";
import HasPermission from "../../contexts/HasPermission";
import QuizCardOperations from "./QuizCardOperations";

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
                style={{background: this.props.is_hidden ? "#DDDDDD": undefined}}
                actions={[
                    <HasPermission id={this.props.course.id} nodes={['view_gradebook']}>
                        <Link to={`/Quiz/Gradebook/${this.props.id}`}><Button icon={<BarChartOutlined />} type={"link"} size={"small"}>Gradebook</Button></Link>
                    </HasPermission>,
                    <HasPermission id={this.props.course.id} nodes={['delete_quiz', 'change_quiz']} any={true}>
                        <QuizCardOperations
                            id={this.props.id}
                            course={this.props.course.id}
                            hidden={this.props.is_hidden}
                            hide={this.props.hide}
                            delete={this.props.delete}>
                            <EllipsisOutlined />
                        </QuizCardOperations>
                    </HasPermission>,
                ]}
            >
                <Meta
                    avatar={<UserIcon />}
                    title={
                        <span>
                            {this.props.title}
                            {(this.props.course) &&
                            <Link to={`/Course/${this.props.course.id}`}>
                                <Tag style={{float: "right"}} color={RandomColorBySeed(this.props.course.id).bg}>
                                    <span style={{color: RandomColorBySeed(this.props.course.id).fg}}>{this.props.course.shortname}</span>
                                </Tag>
                            </Link>}
                        </span>
                    }
                    description={this.displayTimeLeft()}
                />
                <QuizTimeline noLine={false} endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        );
    }
}
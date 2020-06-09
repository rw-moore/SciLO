import React from 'react';
import {Button, Card, Icon, Tag} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import QuizCardOperations from "./QuizCardOperations";
import RandomColorBySeed from "../../utils/RandomColorBySeed";
import HasPermission from "../../contexts/HasPermission";
import {Link} from "react-router-dom";

/* quiz card for the current quiz including late time quiz */
export default class OngoingQuiz extends React.Component {

    // XXX temp state PLEASE REMOVE
    state = {
        hidden: false,
        background: undefined
    };

    // change background if hidden
    changeBackground = () => {
        this.setState({
            background: this.state.hidden?undefined:"lightgrey",
            hidden: !this.state.hidden
        })
    };

    render() {
        const { Meta } = Card;

        return (
            <Card
                style={{background: this.props.background ? this.props.background: this.state.background}}
                actions={[
                    <Button icon="bar-chart" type={"link"} size={"small"}>Stats</Button>,
                    <HasPermission id={this.props.course.id} nodes={["view_attempt"]}>
                        <Button icon="edit" type={"link"} size={"small"} onClick={()=>{this.props.action(this.props.id)}}>Attempt</Button>
                    </HasPermission>,
                    <QuizCardOperations id={this.props.id} course={this.props.course.id} hide={!this.state.hidden} operation={this.changeBackground} delete={this.props.delete}><Icon type="ellipsis" /></QuizCardOperations>
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
                            </Link>
                            }
                        </span>
                    }
                />
                <QuizTimeline endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        )
    }
}
import React from 'react';
import {Card, Icon} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import {Link} from "react-router-dom";
import QuizCardOperations from "./QuizCardOperations";

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
                    <Icon type="bar-chart" />,
                    <Link to={`Quiz/edit/${this.props.id}`}><Icon type="edit" /></Link>,
                    <QuizCardOperations hide={!this.state.hidden} operation={this.changeBackground}><Icon type="ellipsis" /></QuizCardOperations>
                    ]}
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
import React from 'react';
import {Card, Icon, Tag} from "antd";
import UserIcon from "../Users/UserIcon";
import QuizTimeline from "./QuizTimeline";
import {Link} from "react-router-dom";
import QuizCardOperations from "./QuizCardOperations";
import RandomColorBySeed from "../../utils/RandomColorBySeed";

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
                    //<Link to={`Quiz/edit/${this.props.id}`}><Icon type="edit" /></Link>,
                    <Icon type="edit" onClick={()=>{this.props.action(this.props.id)}}/>,
                    <QuizCardOperations hide={!this.state.hidden} operation={this.changeBackground}><Icon type="ellipsis" /></QuizCardOperations>
                    ]}
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
                    description={`Submit: ${Math.floor(Math.random()*36)}/36`}
                />
                <QuizTimeline endTime={this.props.endTime} startTime={this.props.startTime} status={this.props.status}/>
            </Card>
        )
    }
}
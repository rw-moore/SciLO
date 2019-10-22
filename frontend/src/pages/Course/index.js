import React from 'react';
import {Link, withRouter} from "react-router-dom";
import {Button, Collapse, Divider, Icon, List, message, Typography} from "antd";
import "./index.css";
import GetCourseById from "../../networks/GetCourseById";
import CourseQuizzes from "../../components/Course/CourseQuizzes";
import CoursePeople from "../../components/Course/CoursePeople";
import CourseQuestionBank from "../../components/Course/CourseQuestionBank";

class Course extends React.Component {
    state = {
        course: {},
    };

    componentDidMount() {
        this.fetch();
    };

    /* fetch courses */
    fetch = () => {
        this.setState({ data: [], fetching: true });
        GetCourseById(this.props.id, this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch the course, see console for more details.");
                    this.setState({
                        fetching: false,
                    })
                }
                else {
                    const course = data.data;
                    this.setState({
                        fetching: false,
                        course: course,
                    })
                }
            }
        );
    };

    render() {
        const { Panel } = Collapse;
        if (!this.state.fetching) {
            return (
                <div className={"CoursePanel"}>
                    <Typography.Title level={2}>{`${this.state.course.shortname} - ${this.state.course.fullname}`}</Typography.Title>
                    {(!!this.state.course.id) && <div>
                        <CourseQuizzes course={this.state.course} token={this.props.token}/>
                        <Divider dashed/>
                        <CourseQuestionBank course={this.state.course.id} token={this.props.token}/>
                        <Divider dashed/>
                        <CoursePeople groups={this.state.course.groups} token={this.props.token}/>
                    </div>}
                </div>
            )
        }
        else {
            return (
                <></>
            )
        }
    }
}

export default withRouter(Course);
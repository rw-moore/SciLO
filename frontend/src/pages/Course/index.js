import React from 'react';
import {Link, withRouter} from "react-router-dom";
import {Button, Collapse, Icon, List, message, Typography} from "antd";
import "./index.css";
import GetCourseById from "../../networks/GetCourseById";
import CourseQuizzes from "./CourseQuizzes";

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
                    {(!!this.state.course.id) && <CourseQuizzes course={this.state.course} token={this.props.token}/>}
                    <Typography.Title level={3}>{`Questions`}</Typography.Title>

                    <Typography.Title level={3}>{`People`}</Typography.Title>
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
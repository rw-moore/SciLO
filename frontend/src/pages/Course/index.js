import React from 'react';
import {Link, withRouter} from "react-router-dom";
import GetCourses from "../../networks/GetCourses";
import {Collapse, List, message, Typography} from "antd";
import "./index.css";
import GetCourseById from "../../networks/GetCourseById";
import GetQuizByCourse from "../../networks/GetQuizByCourse";

class Course extends React.Component {
    state = {
        data: []
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
                    GetQuizByCourse(this.props.id, this.props.token).then(
                        data => {
                            if (!data || data.status !== 200) {
                                message.error("Cannot fetch course quizzes, see console for more details.");
                                this.setState({
                                    fetching: false,
                                })
                            }
                            else {
                                this.setState({
                                    fetching: false,
                                    course: course,
                                    quizzes: data.data
                                })
                            }
                        }
                    )
                }
            }
        );
    };



    render() {
        const { Panel } = Collapse;
        return (
            <div className={"CoursePanel"}>
                1
            </div>
        )
    }
}

export default withRouter(Course);
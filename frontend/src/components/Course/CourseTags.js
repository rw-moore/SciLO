import React from "react"
import GetCourseById from "../../networks/GetCourseById";
import {message} from "antd";

export default class CourseTags extends React.Component {

    componentDidMount() {

    }

    fetch = () => {
        this.setState({ fetching: true });
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
}
import React from 'react';
import {Link, withRouter} from "react-router-dom";
import GetCourses from "../../networks/GetCourses";
import {Collapse, List, message, Typography} from "antd";
import "./index.css";

class Course extends React.Component {
    state = {
        data: []
    };

    componentDidMount() {
        this.fetchCourses();
    };

    /* fetch courses */
    fetchCourses = () => {
        this.setState({ data: [], fetching: true });
        GetCourses(this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch courses, see console for more details.");
                    this.setState({
                        fetching: false,
                    })
                }
                else {
                    this.setState({
                        fetching: false,
                        data: data.data,
                    });
                }
            }
        );
    };



    render() {
        const { Panel } = Collapse;
        return (
            <div className={"CoursePanel"}>
                <List
                    size={"large"}
                    bordered
                    dataSource={this.state.data}
                    renderItem={course => (
                        <List.Item>
                            <Link to={course.id}><Typography.Text strong>{`${course.shortname} - ${course.fullname}`}</Typography.Text></Link>
                        </List.Item>
                    )}
                />
                <Collapse accordion>
                    {this.state.data.map(course =>
                        <Panel header={<Typography.Text strong>{`${course.shortname} - ${course.fullname}`}</Typography.Text>} key={course.id}>
                            <p>{JSON.stringify(course)}</p>
                        </Panel>
                    )}
                </Collapse>
            </div>
        )
    }
}

export default withRouter(Course);
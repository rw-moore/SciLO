import React from 'react';
import {Link, withRouter} from "react-router-dom";
import GetCourses from "../../networks/GetCourses";
import {Button, Collapse, Icon, List, message, Typography} from "antd";
import "./index.css";
import GetCourseById from "../../networks/GetCourseById";
import GetQuizByCourse from "../../networks/GetQuizByCourse";
import OngoingQuiz from "../../components/QuizCard/OngoingQuiz";
import moment from "moment";
import GetAttemptListByQuiz from "../../networks/GetAttemptListByQuiz";
import QuizInfoModal from "../../components/QuizCard/QuizInfoModal";

class Course extends React.Component {
    state = {
        data: [],
        course: {},
        quizzes: []
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

    fetchAttempt = (quizId, params = {}) => {
        GetAttemptListByQuiz(quizId, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz attempts, see console for more details.");
            } else {
                console.log(data.data);

                this.setState({
                    targetQuiz: quizId,
                    quizAttempts: data.data.quiz_attempts,
                    showQuizModal: true
                });
            }
        });
    };



    render() {
        const { Panel } = Collapse;
        if (!this.state.fetching) {
            return (
                <div className={"CoursePanel"}>
                    <Typography.Title level={2}>{`${this.state.course.shortname} - ${this.state.course.fullname}`}</Typography.Title>
                    <Typography.Title level={3}>
                        {`Quizzes`}
                        <span style={{float: "right"}}>
                            <Link to={{pathname: `/Quiz/new`, search: "?course="+this.state.course.id}}><Button type={"primary"} icon="plus" onClick={this.create}>Create a Quiz</Button></Link>
                        </span>
                    </Typography.Title>
                    {
                        // this.state.quizzes.map((quiz)=>{
                        //     return (
                        //         <OngoingQuiz
                        //             action={this.fetchAttempt}
                        //             id={quiz.id}
                        //             title={<span style={{color: "red"}}>{quiz.title}</span>}
                        //             status={quiz.status}
                        //             endTime={moment.utc(quiz.late_time)}
                        //             startTime={moment.utc(quiz.start_end_time[1])}
                        //         />)
                        // })

                    }
                    <List
                        style={{maxHeight: "calc(100vh - 100px)", marginBottom: 24, overflowY:"auto"}}
                        size={"small"}
                        dataSource={this.state.quizzes}
                        bordered
                        className="listItem"
                        pagination={{
                            showSizeChanger: true,
                            defaultPageSize: 20,
                            pageSizeOptions: ['10','20','50','100']
                        }}
                        renderItem={item => (
                            <List.Item actions={[
                                <Icon type="bar-chart" />,
                                <Link to={`/Quiz/edit/${item.id}`}><Icon type="edit" /></Link>,
                                <Icon type="ellipsis" />]}
                            >
                                <List.Item.Meta
                                    title={<Button type={"link"} onClick={()=>{this.fetchAttempt(item.id)}}>{item.title}</Button>}
                                />
                                <span>Status: {item.status}</span>
                            </List.Item>
                        )}
                    />
                    <QuizInfoModal token={this.props.token} id={this.state.targetQuiz} attempts={this.state.quizAttempts} visible={this.state.showQuizModal} onClose={()=>{this.setState({showQuizModal: false})}}/>
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
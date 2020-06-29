import moment from "moment";
import React from "react";
import {Button, Divider, List, message, Typography} from "antd";
import {Link} from "react-router-dom";
import GetAttemptListByQuiz from "../../networks/GetAttemptListByQuiz";
import GetQuizByCourse from "../../networks/GetQuizByCourse";
import QuizInfoModal from "../QuizCard/QuizInfoModal";
import HasPermission from "../../contexts/HasPermission";
import DeleteQuiz from "../../networks/DeleteQuiz";
import HideQuiz from "../../networks/HideQuiz";
import QuizImportModal from "../../pages/CreateQuiz/QuizImportModal";

export default class CourseQuizzes extends React.Component {
    state = {
        quizzes: []
    };

    componentDidMount() {
        this.setState({fetching: true});
        this.fetch()
    }

    fetch = () => {
        GetQuizByCourse(this.props.course.id, this.props.token).then(
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
                        quizzes: data.data
                    })
                }
            }
        )
    }

    fetchAttempt = (quizId, params = {}) => {
        GetAttemptListByQuiz(quizId, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz attempts, see console for more details.");
            } else {
                console.log(data.data);

                this.setState({
                    targetQuiz: quizId,
                    quizAttempts: data.data.quiz_attempts,
                    create: moment.now() < moment.utc(data.data.end),
                    showQuizModal: true
                });
            }
        });
    };

    delete = (id, course) => {
        this.setState({ loading: true });
        DeleteQuiz(id, course,this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot delete quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            }
            else {
                this.fetch();
            }
        });
    };

    hide = (id, bool) => {
        this.setState({ loading: true });
        HideQuiz(id, bool,this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot hide/reveal quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            }
            else {
                this.fetch();
            }
        });
    }

    render() {
        return (
            <div className="CourseQuizzes">
                <Typography.Title level={3}>
                    {`Quizzes`}
                    <HasPermission id={this.props.course.id} nodes={["add_quiz"]}>
                        <span style={{float: "right"}}>
                            <Link to={{pathname: `/Quiz/new`, search: "?course="+this.props.course.id}}><Button type={"primary"} icon="plus">Create a Quiz</Button></Link>
                            <Divider type={"vertical"}/>
                            <QuizImportModal/>
                        </span>
                    </HasPermission>
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
                    style={{maxHeight: "calc(80vh)", marginBottom: 24, overflowY:"auto"}}
                    size={"small"}
                    dataSource={this.state.quizzes}
                    bordered
                    className="listItem"
                    pagination={{
                        showSizeChanger: true,
                        defaultPageSize: 10,
                        pageSizeOptions: ['10','20','50','100']
                    }}
                    renderItem={item => (
                        <List.Item actions={[
                            <HasPermission id={this.props.course.id} nodes={["view_attempt"]}>
                                <Button size="small" icon="edit" type="link" onClick={()=>{this.fetchAttempt(item.id)}}>Attempt</Button>
                            </HasPermission>,
                            <HasPermission id={this.props.course.id} nodes={["change_quiz"]}>
                                <Button
                                    onClick={()=>(item.is_hidden?this.hide(item.id,false):this.hide(item.id, true))}
                                    size="small"
                                    icon={!item.is_hidden ? "eye-invisible" : "eye"}
                                    type="link"
                                >
                                    {!item.is_hidden ? "Hide" : "Reveal"}
                                </Button>
                            </HasPermission>,
                            <HasPermission id={this.props.course.id} nodes={["change_quiz"]}>
                                <Link to={`/Quiz/edit/${item.id}`}><Button size="small" icon="edit" type="link">Edit</Button></Link>
                            </HasPermission>,
                            <HasPermission id={this.props.course.id} nodes={["delete_quiz"]}>
                                <Button size="small" icon="delete" type="link" style={{color: "red"}} onClick={()=>this.delete(item.id, this.props.course.id)}>Delete</Button>
                            </HasPermission>,
                        ]}
                                   style={{background: item.is_hidden ? "#DDDDDD" : undefined}}
                        >
                            <List.Item.Meta
                                title={<Button type={"link"} onClick={()=>{this.fetchAttempt(item.id)}}>{item.title}</Button>}
                            />
                            <span>Status: {item.status}</span>
                        </List.Item>
                    )}
                />
                <QuizInfoModal create={this.state.create} token={this.props.token} id={this.state.targetQuiz} attempts={this.state.quizAttempts} visible={this.state.showQuizModal} onClose={()=>{this.setState({showQuizModal: false})}}/>
            </div>
        )
    }

}
import React from 'react';
import {Button, Divider, Icon, List, message, Typography} from "antd";
import "./index.css";
import OngoingQuiz from "../../components/QuizCard/OngoingQuiz";
import GetQuizzes from "../../networks/GetQuizzes";
import moment from 'moment';
import InComingQuiz from "../../components/QuizCard/InComingQuiz";
import {Link} from "react-router-dom";
import QuizInfoModal from "../../components/QuizCard/QuizInfoModal";
import GetAttemptListByQuiz from "../../networks/GetAttemptListByQuiz";
import CreateAttemptListByQuiz from "../../networks/CreateAttemptByQuiz";

/**
 * Quiz list showing all the quizzes with card view
 */
export default class QuizList extends React.Component {

    state = {
        targetQuiz: {},
        data: {},
        showQuizModal: false
    };

    componentDidMount() {
        this.fetch();
    }

    fetch = (params = {}) => {
        this.setState({loading: true});
        GetQuizzes(this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                const pagination = {...this.state.pagination};
                pagination.total = data.data.length;
                data.data.quizzes.processing.sort((a, b) => (
                    moment.utc(a.start_end_time[1]).isAfter(moment.utc(b.start_end_time[1]))
                ) ? 1 : -1);
                this.setState({
                    loading: false,
                    data: data.data.quizzes,
                    pagination,
                });
            }
        });
    };

    fetchAttempt = (quizId, params = {}) => {
        this.setState({loading: true});
        GetAttemptListByQuiz(quizId, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz attempts, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                let quiz = this.findQuizById(quizId);
                if (quiz) {
                    quiz = quiz[0]
                }
                console.log(data.data);

                this.setState({
                    loading: false,
                    targetQuiz: quiz,
                    quizAttempts: data.data.quiz_attempts,
                    showQuizModal: true
                });
            }
        });
    };

    createAttempt = (quizId, params = {}) => {
        this.setState({loading: true});
        CreateAttemptListByQuiz(quizId, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot create quiz attempts, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                this.setState({
                    loading: false,
                    targetQuiz: data.data,
                });
            }
        });
    };

    findQuizById = (id) => {
        let result = [];
        Object.values(this.state.data).forEach(set => {
            set.filter(item => (item.id=id)).forEach(filteredQuiz => {result.push(filteredQuiz)});
        });
        return result
    };

    render() {

        const grid = {
            gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4
        };

        return (
            <div className="QuizList">
                <Typography.Title level={2}>
                    My Quiz
                    <Link to="Quiz/new">
                        <Button size={"large"} type={"primary"} style={{float: "right"}}>
                            New
                        </Button>
                    </Link>
                </Typography.Title>
                <div className="Quizzes">
                    <Typography.Title level={3}>Ongoing</Typography.Title>
                    <List
                        grid={grid}
                        dataSource={this.state.data.processing}
                        renderItem={item => ( item.late ?
                            <List.Item>
                                <OngoingQuiz
                                    action={()=>{this.fetchAttempt(item.id)}}
                                    background={"#fffb00"}
                                    id={item.id}
                                    title={<span style={{color: "red"}}>{item.title}</span>}
                                    status={item.status}
                                    endTime={moment.utc(item.late_time)}
                                    startTime={moment.utc(item.start_end_time[1])}
                                />
                            </List.Item>
                            :
                                <List.Item>
                                <OngoingQuiz
                                    action={()=>{this.fetchAttempt(item.id)}}
                                    id={item.id}
                                    title={item.title}
                                    status={item.status}
                                    endTime={moment.utc(item.start_end_time[1])}
                                    startTime={moment.utc(item.start_end_time[0])}
                                />
                            </List.Item>
                        )}
                    />
                    <Divider dashed style={{margin: "0px 0px 12px 0px"}}/>
                    <Typography.Title level={3}>Future</Typography.Title>
                    <List
                        grid={grid}
                        dataSource={this.state.data.not_begin}
                        renderItem={item => (
                            <List.Item>
                                <InComingQuiz
                                    id={item.id}
                                    title={item.title}
                                    status={item.status}
                                    endTime={moment.utc(item.start_end_time[1])}
                                    startTime={moment.utc(item.start_end_time[0])}
                                />
                            </List.Item>
                        )}
                    />
                    <Divider dashed style={{margin: "0px 0px 12px 0px"}}/>
                    <Typography.Title level={3}>Completed</Typography.Title>
                    <List
                        style={{maxHeight: "calc(100vh - 100px)", marginBottom: 24, overflowY:"auto"}}
                        size={"small"}
                        dataSource={this.state.data.done}
                        bordered
                        className="listItem"
                        pagination={{
                            showSizeChanger: true,
                            defaultPageSize: 20,
                            pageSizeOptions: ['10','20','50','100']
                        }}
                        renderItem={item => (
                            <List.Item actions={[
                                <div>{`Submit: ${Math.floor(Math.random()*36)}/36`}</div>,<Icon type="bar-chart" />,
                                <Link to={`Quiz/edit/${item.id}`}><Icon type="edit" /></Link>,
                                <Icon type="ellipsis" />]}
                            >
                                <List.Item.Meta
                                    title={<Button type={"link"}>{item.title}</Button>}
                                />
                                <span>AVG: {Math.floor(Math.random()*100)}% and some other stats</span>
                            </List.Item>
                        )}
                    />
                </div>
                <QuizInfoModal quiz={this.state.targetQuiz} attempts={this.state.quizAttempts} visible={this.state.showQuizModal} onClose={()=>{this.setState({showQuizModal: false})}}/>
            </div>
        )
    }
}
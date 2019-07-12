import React from 'react';
import {List, message, Typography} from "antd";
import "./index.css";
import OngoingQuiz from "../../components/QuizCard/OngoingQuiz";
import GetQuizzes from "../../networks/GetQuizzes";
import moment from 'moment';
import InComingQuiz from "../../components/QuizCard/InComingQuiz";

export default class QuizList extends React.Component {

    state = {
        data: {}
    };

    componentDidMount() {
        this.fetch();
    }

    fetch = (params = {}) => {
        this.setState({loading: true});
        GetQuizzes(params).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch quiz, see console for more details.");
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            } else {
                const pagination = {...this.state.pagination};
                pagination.total = data.data.length;
                this.setState({
                    loading: false,
                    data: data.data.quizzes,
                    pagination,
                });
            }
        });
    }

    render() {

        const grid = {
            gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4,
        };

        return (
            <div className="QuizList">
                <Typography.Title level={2}>My Quiz</Typography.Title>
                <div className="OngoingQuiz">
                    <Typography.Title level={3}>Ongoing</Typography.Title>
                    <List
                        grid={grid}
                        dataSource={this.state.data.processing}
                        renderItem={item => (
                            <List.Item>
                                <OngoingQuiz
                                    title={item.title}
                                    status={item.status}
                                    endTime={moment.utc(item.start_end_time[1])}
                                    startTime={moment.utc(item.start_end_time[0])}
                                />
                            </List.Item>
                        )}
                    />
                    <Typography.Title level={3}>Future</Typography.Title>
                    <List
                        grid={grid}
                        dataSource={this.state.data.not_begin}
                        renderItem={item => (
                            <List.Item>
                                <InComingQuiz
                                    title={item.title}
                                    status={item.status}
                                    endTime={moment.utc(item.start_end_time[1])}
                                    startTime={moment.utc(item.start_end_time[0])}
                                />
                            </List.Item>
                        )}
                    />
                    <Typography.Title level={3}>Completed</Typography.Title>
                    <List
                        grid={grid}
                        dataSource={this.state.data.done}
                        renderItem={item => (
                            <List.Item>
                                <OngoingQuiz/>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        )
    }
}
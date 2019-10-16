import React from "react";
import {Col, Divider, Icon, message, Row, Tooltip} from "antd";
import questions from "../../mocks/Questions";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";
import CreateQuizForm from "../../components/Forms/CreateQuizForm";
import GetQuizById from "../../networks/GetQuizById";

/**
 * Page for create / modify a quiz
 */
class CreateQuiz extends React.Component {
    state = {
        questions: {},
        fetched: {},
        order: [],
        preview: true
    };

    componentDidMount() {
        if (this.props.id) {this.fetch();}
        this.fetchQuestions(this.props.questions);

    }

    fetch = () => {
        GetQuizById(this.props.id, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch quiz ${this.props.id}, see console for more details.`);
                console.error("FETCH_FAILED", data);
            } else {
                const quiz = data.data;
                const questions = {};
                const order = [];
                quiz.questions.forEach(question => {
                    questions[question.id] = question;
                    order.push(question.id);
                });

                this.setState({
                    fetched: data.data,
                    questions: questions,
                    order: order
                });

            }
        });
    };

    fetchQuestions = (questions) => {
        if (!questions) {
            return
        }
        questions.forEach(id => {
            GetQuestionById(id, this.props.token).then(data => {
                if (!data || data.status !== 200) {
                    message.error(`Cannot fetch question ${this.props.id}, see console for more details.`);
                    console.error("FETCH_FAILED", data);
                } else {
                    const questions = this.state.questions;
                    questions[id] = data.data.question;
                    this.setState({
                        questions: questions,
                        order: this.state.order.includes(id) ? this.state.order : this.state.order.concat(id)
                    });
                }
            });
        });
    };

    fetchCourses = () => {

    };

    setOrder = (order) => {
        this.setState({order: order})
    };

    update = (ids) => {
        const filteredOldIds = this.state.order.filter(id=> ids.includes(id));  // may have removed some old questions
        this.setState({order: filteredOldIds});
        this.fetchQuestions(ids);
    };

    delete = (id) => {
        const questions = this.state.questions;
        questions[id] = undefined;
        this.setState({
            order: this.state.order.filter(item => item !== id),
            questions: questions
        })
    };


    render() {

        const colResponsive = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: this.state.preview ? 12 : 24
        };

        const divider = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 0
        };

        const previewIcon = (
            <Tooltip title={this.state.preview ? "hide preview" : "show preview"}>
                <Icon
                    type={this.state.preview ? "eye-invisible" : "eye"}
                    theme="filled"
                    style={{float: "right"}}
                    onClick={() => {
                        this.setState({preview: !this.state.preview})
                    }}
                />
            </Tooltip>
        );

        return (
            <Row gutter={8}>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "89vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>{this.props.id ? "Edit Quiz" : "New Quiz"} {!this.state.preview && previewIcon}</h1>
                        <CreateQuizForm
                            course={this.props.course}
                            token={this.props.token}
                            goBack={this.props.history.goBack}
                            fetched={this.state.fetched}
                            questions={this.state.questions}
                            setOrder={this.setOrder}
                            order={this.state.order}
                            delete={this.delete}
                            update={this.update}
                            keys={this.props.questions}
                        />
                    </div>
                </Col>
                {   this.state.preview  && <>
                    <Col {...divider}><div><Divider/></div></Col>
                    <Col {...colResponsive} style={{overflowY: "hidden"}}>
                        <div style={{
                            padding: 22,
                            background: '#fff',
                            height: "89vh",
                            overflowY: "auto",
                            borderStyle: "solid",
                            borderRadius: "4px",
                            borderColor: "#EEE",
                            borderWidth: "2px"
                        }}>
                            <h1>
                                Preview
                                {previewIcon}
                            </h1>
                            {this.state.questions && this.state.order.map(id => (
                                <span key={id} style={{margin: 16}}>
                                    <OfflineFrame
                                        key={id}
                                        question={this.state.questions[id]}/>
                                </span>))}
                                {questions.map(question => (
                                    <span key={question.title} style={{margin: 16}}>
                                        <OfflineFrame
                                            question={question}/>
                                    </span>
                                ))}
                        </div>
                    </Col>
                </>}
            </Row>

        )
    }
}

export default withRouter(CreateQuiz);
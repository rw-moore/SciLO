import React from "react";
import {Col, Divider, Icon, message, Popover, Row, Tooltip} from "antd";
import questions from "../../mocks/Questions";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";
import FractionDisplay from "../../utils/FractionDisplay";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";
import CreateQuizForm from "../../components/Forms/CreateQuizForm";

class CreateQuiz extends React.Component {
    state = {
        questions: {},
        order: [],
        preview: true
    };

    componentDidMount() {
        //if (this.props.id) {this.fetch();}
        //this.setState({question: this.props.question});
        this.fetchQuestions(this.props.questions);

    }

    fetchQuestions = (questions) => {
        //this.setState({ loading: true });
        if (!questions) {
            return
        }
        questions.forEach(id => {
            GetQuestionById(id).then(data => {
                if (!data || data.status !== 200) {
                    message.error(`Cannot fetch question ${this.props.id}, see console for more details.`);
                    console.error("FETCH_FAILED", data);
                } else {
                    const questions = this.state.questions;
                    let question = data.data.question;
                    questions[id] = question;
                    this.setState({
                        questions: questions,
                        order: this.state.order.includes(id) ? this.state.order : this.state.order.concat(id)
                    });
                }
            });
        });
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
                                    <BasicFrame
                                        key={id}
                                        question={this.state.questions[id]}/>
                                </span>))}
                                {questions.map(question => (
                                    <span key={question.title} style={{margin: 16}}>
                                        <BasicFrame
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
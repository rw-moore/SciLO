import React from "react";
import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Col, Divider, message, Row, Tooltip } from "antd";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";
import CreateQuizForm from "../../components/Forms/CreateQuizForm";
import GetQuizById from "../../networks/GetQuizById";
import GetQuestionWithVars from "../../networks/GetQuestionWithVars";
import API from "../../networks/Endpoints";

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
                message.error(`Cannot fetch quiz ${this.props.id}, see browser console for more details.`);
                console.error("FETCH_FAILED", data);
            } else {
                const quiz = data.data;
                const questions = {};
                const order = [];
                const loaded_vars = {};
                const var_questions = {};
                quiz.questions.forEach(question => {
                    question.question_image = question.question_image.map(file=>({...file, url:API.domain+":"+API.port+"/api"+file.url}));
                    questions[question.id] = question;
                    loaded_vars[question.id] = false;
                    var_questions[question.id] = {};
                    order.push(question.id);
                });
                console.log('fetch', data.data);
                this.setState({
                    fetched: data.data,
                    questions: questions,
                    order: order,
                    loaded_vars: loaded_vars,
                    var_questions: var_questions
                });

            }
        });
    };

    fetchQuestions = (questions) => {
        if (!questions) {
            return
        }
        questions.forEach(id => {
            let load_vars = this.state.loaded_vars[id];
            this.setState({loaded_vars: {[id]: false}});
            GetQuestionById(id, this.props.token).then(data => {
                if (!data || data.status !== 200) {
                    message.error(`Cannot fetch question ${this.props.id}, see browser console for more details.`);
                    console.error("FETCH_FAILED", data);
                } else {
                    const questions = this.state.questions;
                    questions[id] = data.data.question;
                    questions[id].question_image = questions[id].question_image.map(file=>({...file, url:API.domain+":"+API.port+"/api"+file.url}));
                    this.setState({
                        questions: questions,
                        order: this.state.order.includes(id) ? this.state.order : this.state.order.concat(id)
                    }, ()=> {
                        if (load_vars) {
                            this.fetchWithVariables(id);
                        }
                    });
                }
            });
        });
    };

    fetchWithVariables = (id) => {
        GetQuestionWithVars(this.state.questions[id], this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error(`Error occured while trying to substitute variables, see browser console for more details.`, 7);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                });
            } else {
                let question = data.data.question;
                const var_questions = this.state.var_questions;
                var_questions[id] = question;
                const loaded_vars = this.state.loaded_vars;
                loaded_vars[id] = true;
                this.setState({var_questions: var_questions, loaded_vars: loaded_vars});
            }
        })
    }

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
                {this.state.preview ? 
                    <EyeInvisibleFilled 
                        style={{float: "right"}}
                        onClick={() => {
                            this.setState({preview: !this.state.preview})
                        }}
                    />
                    :
                    <EyeFilled
                        style={{float: "right"}}
                        onClick={() => {
                            this.setState({preview: !this.state.preview})
                        }}
                    />
                }
            </Tooltip>
        );

        return (
            <Row gutter={8}>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "89vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>{this.props.id ? "Edit Quiz" : "New Quiz"} {!this.state.preview && previewIcon}</h1>
                        {((this.props.id && Object.keys(this.state.fetched).length) || !this.props.id) &&
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
                                keys={Object.keys(this.state.questions)}
                            />
                        }
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
                                        question={this.state.loaded_vars[id]?this.state.var_questions[id]:this.state.questions[id]}
                                        token={this.props.token}
                                        loadVars={()=>this.fetchWithVariables(id)}
                                        images={this.state.questions[id].question_image}
                                    />
                                </span>))}
                            {/* {questions.map(question => (
                                <span key={question.title} style={{margin: 16}}>
                                    <OfflineFrame
                                        question={question}/>
                                </span>
                            ))} */}
                        </div>
                    </Col>
                </>}
            </Row>

        )
    }
}

export default withRouter(CreateQuiz);
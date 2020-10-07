import React from "react";
import {Col, Divider, Icon, message, Row, Tooltip} from "antd";
import questions from "../../mocks/Questions";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
// import FractionDisplay from "../../utils/FractionDisplay";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";

/**
 * page for creating / modifying a question
 */
class CreateQuestions extends React.Component {
    state = {
        preview: true
    };

    componentDidMount() {
         if (this.props.id) {this.fetch();}
        //this.setState({question: this.props.question});
    }

    fetch = () => {
        //this.setState({ loading: true });
        GetQuestionById(this.props.id, this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch question ${this.props.id}, see console for more details.`);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            }
            else {
                let question = data.data.question;
                this.setState({question: question})
            }
        });

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
                        <h1>{this.props.id ? "Edit Question" : "New Question"} {!this.state.preview && previewIcon} </h1>
                        {
                            this.props.id ?
                            (this.state.question) &&
                                <CreateQuestionForm
                                    token={this.props.token}
                                    goBack={this.props.closeModal?this.props.closeModal:this.props.history.goBack}
                                    question={this.state.question}
                                    preview={(question)=>(this.setState({question: {...this.state.question, ...question}}))}
                                />
                                :
                                <CreateQuestionForm
                                    course={this.props.course}
                                    token={this.props.token}
                                    goBack={this.props.closeModal?this.props.closeModal:this.props.history.goBack}
                                    preview={(question)=>(this.setState({question: {...this.state.question, ...question}}))}
                                />
                        }

                    </div>
                </Col>
                {this.state.preview && <>
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
                            {this.state.question &&
                            <OfflineFrame key={this.state.question.title} question={this.state.question} token={this.props.token}/>}
                            {/* {questions.map(question => (
                                <span key={question.title} style={{margin: 16}}><OfflineFrame question={question}/></span>))} */}
                        </div>
                    </Col>
                </>}
            </Row>

        )
    }
}

export default withRouter(CreateQuestions);
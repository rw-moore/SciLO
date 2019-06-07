import React from "react";
import {Col, Divider, Row} from "antd";
import questions from "../../mocks/Questions";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";
import FractionDisplay from "../../utils/FractionDisplay";
import {withRouter} from "react-router-dom";

class CreateQuestions extends React.Component {

    state = {
    };

    render() {

        const colResponsive = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 12
        };

        const divider = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 0
        };

        return (
            <Row gutter={8}>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "88vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>New Question</h1>
                        <CreateQuestionForm goBack={this.props.history.goBack} preview={(question)=>(this.setState({question}))}/>
                    </div>
                </Col>
                <Col {...divider}><div><Divider/></div></Col>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "88vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>Preview</h1>
                        {this.state.question && <BasicFrame key={this.state.question.title} question={this.state.question}/>}
                        {questions.map(question=>(<span key={question.title} style={{margin: 16}}><BasicFrame question={question}/></span>))}
                        {FractionDisplay()}
                    </div>
                </Col>
            </Row>

        )
    }
}

export default withRouter(CreateQuestions);
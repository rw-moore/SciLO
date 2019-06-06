import React from "react";
import {Col, Divider, Row} from "antd";
import questions from "../../mocks/Questions";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";
import FractionDisplay from "../../utils/FractionDisplay";

export default class CreateQuestions extends React.Component {

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
                <Col {...colResponsive} >
                    <div style={{ padding: 24, background: '#fff', minHeight: "80vh" }}>
                        <h1>New Question</h1>
                        <CreateQuestionForm preview={(question)=>(this.setState({question}))}/>
                    </div>
                </Col>
                <Col {...divider}><div><Divider/></div></Col>
                <Col {...colResponsive}>
                    <div style={{ padding: 24, background: '#fff', minHeight: "80vh" }}>
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
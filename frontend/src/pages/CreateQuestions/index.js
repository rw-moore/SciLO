import React from "react";
import {Button, Col, Divider, Empty, Form, Icon, Input, Layout, Radio, Row, Select} from "antd";
import data from "../../mocks/QuestionBankTable";
import questions from "../../mocks/Questions";
import tags from "../../mocks/Tags"
import CreateQuestionForm from "../../components/forms/CreateQuestionForm";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";


let id = 0;

export default class CreateQuestions extends React.Component {

    state = {
    };

    handleSubmit = e => {
        e.preventDefault();
        /*
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { keys, names } = values;
                console.log('Received values of form: ', values);
                console.log('Merged values:', keys.map(key => names[key]));
            }
        });
        */
    };

    render() {

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const buttonItemLayout = {
            wrapperCol: { span: 14, offset: 4 },
        };

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

        const { TextArea } = Input;



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
                        {questions.map(question=>(<span style={{margin: 16}}><BasicFrame key={question.title} question={question}/></span>))}
                        {questions.length ?
                            undefined
                            :<Empty />
                        }
                    </div>
                </Col>
            </Row>

        )
    }
}
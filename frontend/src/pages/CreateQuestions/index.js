import React from "react";
import {Button, Col, Divider, Empty, Form, Icon, Input, Layout, Radio, Row, Select} from "antd";
import data from "../../mocks/QuestionBankTable";
import tags from "../../mocks/Tags"

let id = 0;

export default class CreateQuestions extends React.Component {

    state = {
        questions: []
    };

    remove = k => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    add = () => {
        let questions = this.state.questions;
        questions.push(
            <div id={id}>
                <span>new response {id}</span>
                <Input style={{width: "70%", float: "right"}}/>
            </div>
        );
        id = id + 1;
        this.setState(questions)
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
                        <Form>
                            <Form.Item required label="Title" {...formItemLayout}>
                                <Input placeholder="enter a title" />
                            </Form.Item>
                            <Form.Item label="Background" {...formItemLayout}>
                                <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="description of the question" />
                            </Form.Item>
                            <Form.Item label="Tags" {...formItemLayout}>
                                <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                                    {tags}
                                </Select>
                            </Form.Item>
                            <Divider/>
                            {this.state.questions.map(q => (
                                <>
                                <Divider/>
                                <Form.Item>
                                    {q}
                                </Form.Item>
                                </>
                                ))}
                            <Form.Item {...formItemLayoutWithoutLabel}>
                                <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
                                    <Icon type="plus" /> Add field
                                </Button>
                            </Form.Item>
                            <Divider/>
                            <Form.Item {...buttonItemLayout}>
                                <Button type="primary" onClick={this.handleSubmit}>Submit</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
                <Col {...divider}><div><Divider/></div></Col>
                <Col {...colResponsive}>
                    <div style={{ padding: 24, background: '#fff', minHeight: "80vh" }}>
                        <h1>Preview</h1>
                        {this.state.questions.length ?
                            this.state.questions.map(q => (
                        <>
                            <Divider/>
                            <Form.Item>
                                {q}
                            </Form.Item>
                        </>
                        ))
                            :<Empty />
                        }
                    </div>
                </Col>
            </Row>

        )
    }
}
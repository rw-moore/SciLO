import React from "react";
import {Button, Col, Divider, Empty, Form, Input, Layout, Radio, Row, Select} from "antd";
import data from "../../mocks/QuestionBankTable";
import tags from "../../mocks/Tags"

export default class CreateQuestions extends React.Component {

    state = {};

    handleFormLayoutChange = e => {
        this.setState({ formLayout: e.target.value });
    };


    render() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
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
                            <Form.Item label="Title" {...formItemLayout}>
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
                            <Form.Item {...buttonItemLayout}>
                                <Button type="primary">Submit</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
                <Col {...divider}><div><Divider/></div></Col>
                <Col {...colResponsive}>
                    <div style={{ padding: 24, background: '#fff', minHeight: "80vh" }}>
                        <h1>Preview</h1>
                        <Empty />
                    </div>
                </Col>
            </Row>

        )
    }
}
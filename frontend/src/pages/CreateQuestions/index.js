import React from "react";
import {Button, Col, Divider, Form, Input, Layout, Radio, Row} from "antd";
import data from "../../mocks/QuestionBankTable";

export default class CreateQuestions extends React.Component {

    state = {
        formLayout: "horizontal"
    };

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


        return (
            <Row gutter={8}>
                <Col {...colResponsive} >
                    <div style={{ padding: 24, background: '#fff', minHeight: "80vh" }}>
                        <Form>
                            <Form.Item label="Form Layout" {...formItemLayout}>
                                <Radio.Group defaultValue="horizontal" onChange={this.handleFormLayoutChange}>
                                    <Radio.Button value="horizontal">Horizontal</Radio.Button>
                                    <Radio.Button value="vertical">Vertical</Radio.Button>
                                    <Radio.Button value="inline">Inline</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="Field A" {...formItemLayout}>
                                <Input placeholder="input placeholder" />
                            </Form.Item>
                            <Form.Item label="Field B" {...formItemLayout}>
                                <Input placeholder="input placeholder" />
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
                        <Form>
                            <Form.Item label="Form Layout" {...formItemLayout}>
                                <Radio.Group defaultValue="horizontal" onChange={this.handleFormLayoutChange}>
                                    <Radio.Button value="horizontal">Horizontal</Radio.Button>
                                    <Radio.Button value="vertical">Vertical</Radio.Button>
                                    <Radio.Button value="inline">Inline</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="Field A" {...formItemLayout}>
                                <Input placeholder="input placeholder" />
                            </Form.Item>
                            <Form.Item label="Field B" {...formItemLayout}>
                                <Input placeholder="input placeholder" />
                            </Form.Item>
                            <Form.Item {...buttonItemLayout}>
                                <Button type="primary">Submit</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
            </Row>

        )
    }
}
import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Col, message, Row, Switch, Typography } from 'antd';
import PatchUser from "../../networks/PatchUser";


class UserMethodsUpdateForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                PatchUser(this.props.user.id, values, this.props.token).then( data => {
                    if (!data || data.status !== 200) {
                        message.error(`Cannot update profile of ${this.props.name}, see browser console for more details.`);
                        this.setState({
                            loading: false
                        })
                    }
                    else {
                        this.setState({
                            loading: false
                        });
                        this.props.refresh();
                    }
                });
            }
        });
    };

    atleastone = (rule, value, callback) => {
        const {form} = this.props;
        if (value) {
            callback();
        } else {
            Object.entries(this.props.user.authmethods).forEach(method => {
                if (form.getFieldValue('authmethods.'+method[0])) {
                    callback();
                }
            });
        }
        return callback('At least one login method must be enabled');
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 4,
                },
            },
        };
        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Row>
                    <Col offset={1}>
                        <Typography.Title level={3}>Authentication Methods</Typography.Title>
                    </Col>
                </Row>
                {Object.entries(this.props.user.authmethods).map(method => {
                    return (
                        <Form.Item label={method[0]} key={method[0]}>
                            {getFieldDecorator('authmethods.'+method[0], 
                                {
                                    initialValue: method[1],
                                    valuePropName: 'checked',
                                    rules: [{
                                        validator: this.atleastone
                                    }]
                                })(<Switch />)
                            }
                        </Form.Item>
                    )
                })}
                <Row>
                    <Col offset={1}>
                        <Typography.Title level={3}>Preferences</Typography.Title>
                    </Col>
                </Row>
                {Object.entries(this.props.user.preferences).map(preference => {
                    return (
                        <Form.Item label={preference[0]} key={preference[0]}>
                            {getFieldDecorator('preferences.'+preference[0], 
                                {
                                    initialValue: preference[1],
                                    valuePropName: 'checked',
                                })(<Switch />)
                            }
                        </Form.Item>
                    )
                })}
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Update
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}

export default Form.create({ name: 'register' })(UserMethodsUpdateForm);
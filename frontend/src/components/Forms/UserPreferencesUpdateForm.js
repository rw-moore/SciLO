import { Button, Col, Form, message, Row, Switch, Typography } from 'antd';
import React from 'react';
import PatchUser from "../../networks/PatchUser";


class UserMethodsUpdateForm extends React.Component {
    formRef = React.createRef();

    handleSubmit = e => {
        e.preventDefault();
        this.formRef.current.validateFieldsAndScroll().then(values => {
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
        }).catch(err=> {
            console.error(err);
        });
    };

    render() {

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
        const defaults = {
            authmethods: {},
            preferences: {}
        }
        const authmethods = Object.entries(this.props.user.authmethods).map(method => {
            defaults.authmethods[method[0]] = method[1];
            return (
                <Form.Item
                    name={["authmethods", method[0]]}
                    label={method[0]}
                    key={method[0]}
                    valuePropName={"checked"}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (value) {
                                    return Promise.resolve();
                                } else {
                                    let arr = Object.entries(this.props.user.authmethods);
                                    for (let i=0; i<arr.length; i++) {
                                        if (getFieldValue(["authmethods", arr[i][0]])) {
                                            return Promise.resolve();
                                        }
                                    }
                                }
                                return Promise.reject(new Error('At least one login method must be enabled'));
                            }
                        })
                    ]}
                >
                    <Switch/>
                </Form.Item>
            )
        });
        const preferences = Object.entries(this.props.user.preferences).map(preference => {
            defaults.preferences[preference[0]] = preference[1];
            return (
                <Form.Item 
                    label={preference[0]} 
                    key={preference[0]}
                    name={["preferences", preference[0]]}
                    valuePropName={"checked"}
                >
                    <Switch />
                </Form.Item>
            )
        });
        return (
            <Form 
                {...formItemLayout} 
                onSubmit={this.handleSubmit} 
                ref={this.formRef}
                initialValues={defaults}
            >
                <Row>
                    <Col offset={1}>
                        <Typography.Title level={3}>Authentication Methods</Typography.Title>
                    </Col>
                </Row>
                {authmethods}
                <Row>
                    <Col offset={1}>
                        <Typography.Title level={3}>Preferences</Typography.Title>
                    </Col>
                </Row>
                {preferences}
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Update
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}

export default UserMethodsUpdateForm;
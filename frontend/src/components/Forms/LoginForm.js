import React from "react";
import {Form, Icon, Input, Button, Checkbox, message} from 'antd';

import "./LoginForm.css"
import UserLogin from "../../networks/UserLogin";

class LoginForm extends React.Component {
    state = {loading: false};

    handleSubmit = e => {
        e.preventDefault();
        this.setState({loading: true});
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                UserLogin(values).then( data => {
                    if (!data || data.status !== 200) {
                        message.error(`Login failed. ${data?data.data.message:"See console for more details"}`);
                    }
                    else {
                        this.props.setUser(data.data);
                    }
                });
            }
        });
        this.setState({loading: false});
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Username"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="Password"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: true,
                    })(<Checkbox>Remember me</Checkbox>)}
                    <a className="login-form-forgot" href="/User/forget-password">
                        Forgot password
                    </a>
                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.handleSubmit} loading={this.state.loading}>
                        Log in
                    </Button>
                    Or <a href="/User/register">register now!</a>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({ name: 'LoginForm' })(LoginForm);

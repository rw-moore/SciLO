import React from "react";
import {Button, Checkbox, Form, Icon, Input, message} from 'antd';
import {Redirect} from "react-router-dom";

import "./LoginForm.css"
import UserLogin from "../../networks/UserLogin";
import LoginWithGoogle from "../../networks/LoginWithGoogle";

import GoogleLogin from 'react-google-login';

/**
 * Login form for both the top header control and in-page login
 */
class LoginForm extends React.Component {
    state = {
        loading: false,
        redirect: false,
        profile: {}
    };

    handleSubmit = e => {
        e.preventDefault();
        this.setState({loading: true});
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                UserLogin(values).then( data => {
                    if (!data || data.status !== 200) {
                        message.error(`Login failed. ${data?data.data.message:"see browser console for more details"}`);
                    }
                    else {
                        this.props.setUser(data.data);
                    }
                });
            }
        });
        this.setState({loading: false});
    };
    onSignIn = googleUser => {
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();
        // console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        // console.log('Full Name: ' + profile.getName());
        // console.log('Given Name: ' + profile.getGivenName());
        // console.log('Family Name: ' + profile.getFamilyName());
        // console.log("Image URL: " + profile.getImageUrl());
        // console.log("Email: " + profile.getEmail());

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        // console.log("ID Token: " + id_token);
        LoginWithGoogle({id_token:id_token, email: profile.getEmail()}).then(data => {
            if (!data || data.status !== 200) {
                if (data && data.status === 303) {
                    this.setState({profile:profile});
                    this.setNeedRegister();
                } else {
                    message.error("Could not login, see browser console for more details.");
                }
            } else {
                this.props.setUser(data.data);
            }
        })
    }
    onGoogleFail = response => {
        console.log(response);
    }
    setNeedRegister = () => {
        this.setState({
            redirect: true
        })
    }
    renderRedirect = () => {
        if (this.state.redirect) {
            return <Redirect to={{
                pathname:'/User/register',
                state: {
                    username:this.state.profile.getEmail().split('@')[0],
                    email:this.state.profile.getEmail(),
                    firstname:this.state.profile.getGivenName(),
                    lastname:this.state.profile.getFamilyName(),
                    institute:this.state.profile.getEmail().split('@')[1].split('.')[0],
                    avatar:this.state.profile.getImageUrl()
                }
            }}/>
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('username', 
                        {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input 
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                placeholder="Username"
                            />
                        )
                    }
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', 
                        {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                            />
                        )
                    }
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('remember', 
                        {
                            valuePropName: 'checked',
                            initialValue: true,
                        })(<Checkbox>Remember me</Checkbox>)
                    }
                    <a className="login-form-forgot" href="/User/forget-password">
                        Forgot password
                    </a>
                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.handleSubmit} loading={this.state.loading}>
                        Log in
                    </Button>
                    Or <a href="/User/register">register now!</a>
                </Form.Item>
                <Form.Item>
                    <GoogleLogin
                        clientId="216032897049-hvr6e75vc4cnb4ulvblh2vq97jqhke75.apps.googleusercontent.com"
                        buttonText="Login"
                        onSuccess={this.onSignIn}
                        onFailure={this.onGoogleFail}
                        cookiePolicy={'single_host_origin'}
                    />
                    {this.renderRedirect()}
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({ name: 'LoginForm' })(LoginForm);

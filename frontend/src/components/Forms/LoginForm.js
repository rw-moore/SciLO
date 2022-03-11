import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message } from 'antd';
import React from "react";
import GoogleLogin from 'react-google-login';
import LoginWithGoogle from "../../networks/LoginWithGoogle";
import UserLogin from "../../networks/UserLogin";
import "./LoginForm.css";

/**
 * Login form for both the top header control and in-page login
 */
class LoginForm extends React.Component {
    state = {
        loading: false,
    };
    formRef = React.createRef();

    handleSubmit = e => {
        e.preventDefault();
        this.setState({loading: true});
        this.formRef.current.validateFields().then(values => {
            // console.log('Received values of form: ', values);
            UserLogin(values).then( data => {
                if (!data || data.status !== 200) {
                    message.error(`Login failed. ${data?data.data.message:"see browser console for more details"}`);
                }
                else {
                    this.props.setUser(data.data);
                }
            });
        }).catch(err => {
            console.error(err);
        });
        this.setState({loading: false});
    };
    onSignIn = googleUser => {
        // Useful data for your client-side scripts:
        let profile = googleUser.getBasicProfile();
        // console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        // console.log('Full Name: ' + profile.getName());
        // console.log('Given Name: ' + profile.getGivenName());
        // console.log('Family Name: ' + profile.getFamilyName());
        // console.log("Image URL: " + profile.getImageUrl());
        // console.log("Email: " + profile.getEmail());

        // The ID token you need to pass to your backend:
        let id_token = googleUser.getAuthResponse().id_token;
        // console.log("ID Token: " + id_token);
        LoginWithGoogle({id_token:id_token, email: profile.getEmail()}).then(data => {
            if (!data || data.status !== 200) {
                message.error("Could not login, see browser console for more details.");
            } else {
                this.props.setUser(data.data);
            }
        })
    }
    onGoogleFail = response => {
        console.log(response);
    }
    render() {
        return (
            <Form 
                onSubmit={this.handleSubmit} 
                className="login-form" 
                ref={this.formRef}
                initialValues={{
                    remember: true
                }}
            >
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your username!'
                        }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                        placeholder="Username"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password'
                        }
                    ]}
                >
                    <Input
                        prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                        noStyle={true}
                    >
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <a className="login-form-forgot" href="/User/forget-password">
                        Forgot password
                    </a>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.handleSubmit} loading={this.state.loading}>
                        Log in
                    </Button>
                    Or <a href="/User/register">register now!</a>
                </Form.Item>
                <Form.Item>
                    <GoogleLogin
                        clientId="216032897049-hvr6e75vc4cnb4ulvblh2vq97jqhke75.apps.googleusercontent.com"
                        buttonText="Sign in with UAlberta Google account"
                        onSuccess={this.onSignIn}
                        onFailure={this.onGoogleFail}
                        cookiePolicy={'single_host_origin'}
                        isSignedIn={true}
                    />
                </Form.Item>
            </Form>
        );
    }
}

export default LoginForm;

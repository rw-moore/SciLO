import React from "react";
import {Button, Checkbox, Icon, Input, Steps, Form, Divider, message} from "antd";
import CheckUsername from "../../networks/CheckUsername";
import SendEmailCaptcha from "../../networks/SendEmailCaptcha";
import VerifyEmailCaptcha from "../../networks/VerifyEmailCaptcha";
import ResetPasswordCaptcha from "../../networks/ResetPasswordCaptcha";

export default class ForgetPassword extends React.Component {
    state = {
        current: 0
    };

    searchUser = () => {
        const callback = (result) => {
            if (result === "This username has been used.") {
                this.setState({current: 1, nameStatus: "success"});
            }
            else if (!result) {
                message.error("This user does not exist.");
                this.setState({nameStatus: "error"});
            }
            else {
                message.error(result);
                this.setState({nameStatus: "warning"});
            }
        };

        if (this.state.username) {
            CheckUsername(this.state.username, callback);
        }
    };

    sendEmailCaptcha = () => {
        this.setState({loadingEmailCaptcha: true});
        ResetPasswordCaptcha(this.state.username).then(data => {
            if (!data || data.status !== 200) {
                if (data.status >= 400) {
                    message.error(`Cannot send verification captcha, see console for more details.`);
                    this.setState({captchaStatus: "warning"});
                }
                else {
                    message.error(data.data.message);
                    this.setState({captchaStatus: "error"});
                }
            }
            else {
                this.setState({sentEmail: true, loadingEmailCaptcha: false, captchaStatus: "success"});
                setTimeout(()=>{
                    this.setState({sentEmail: false});
                }, 60000);
            }
        });
    };

    verifiedEmail = () => {
        this.setState({loadingEmailCaptcha: true});
        const info = {
            code: this.state.emailCaptcha,
            username: this.state.username
        };
        VerifyEmailCaptcha(info).then(data => {
            if (!data || data.status !== 200) {
                if (data.status > 400) {
                    message.error(`Cannot send captcha, see console for more details.`);
                    this.setState({captchaStatus: "warning"});
                }
                else {
                    message.error(data.data.message);
                    this.setState({captchaStatus: "error"});
                }
                this.setState({
                    loadingEmailCaptcha: false
                })
            }
            else {
                this.setState({
                    emailCaptcha:null,
                    sentEmail: false,
                    loadingEmailCaptcha: false,
                    captchaStatus: "success",
                    token: data.data.token,
                    current: 2,
                });
                console.log(data);
                message.success("Captcha verified!");
            }
        });
    };

    render() {
        const { current } = this.state;
        const { Step } = Steps;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
        };

        const steps = [
            {
                title: 'Username',
                content: <div>
                    <Form.Item label={"User name"} {...formItemLayout} required validateStatus={this.state.nameStatus}>
                        <Input.Search
                            placeholder={"Enter your username to continue..."}
                            value={this.state.username}
                            onChange={(e)=>{this.setState({username: e.target.value, nameStatus: undefined})}}
                            onSearch={this.searchUser}
                        />
                    </Form.Item>
                </div>
            },
            {
                title: 'Verify',
                content: <div>
                    <Form.Item
                        label="Captcha"
                        {...formItemLayout}
                        validateStatus={this.state.captchaStatus}
                        //extra={this.props.user.email_active ? "Your Email has been verified" : "We must make sure that your email can be verified."}
                    >
                        <Input.Search
                            value={this.state.emailCaptcha}
                            enterButton={
                                <Button
                                    disabled={this.state.sentEmail && !this.state.emailCaptcha}
                                    loading={this.state.loadingEmailCaptcha}
                                >
                                    {this.state.sentEmail || this.state.emailCaptcha ? "Verify" : "Get captcha"}
                                </Button>
                            }
                            onChange={(e)=>{this.setState({emailCaptcha: e.target.value, captchaStatus: undefined})}}
                            onSearch={()=>{
                                if (this.state.emailCaptcha) {
                                    this.verifiedEmail();
                                }
                                else {
                                    this.sendEmailCaptcha();
                                }
                            }}
                        />
                    </Form.Item>
                </div>
            },
            {
                title: 'Password',
                content: 'Last-content',
            },
        ];

        return (
            <div>
                <Steps current={current}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <br/>
                <br/>
                <div
                    style={{marginTop: 16,
                        border: "1px dashed #e9e9e9",
                        borderRadius: 6,
                        backgroundColor: "#fafafa",
                        minHeight: 200,
                        textAlign: "center",
                        paddingTop: 80}}
                >
                    {steps[current].content}
                </div>
                <div className="steps-action">
                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={() => this.next()}>
                            Next
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button type="primary">
                            Done
                        </Button>
                    )}
                    {current > 0 && (
                        <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    )}
                </div>
                <br/>
                <br/>
                <p>Notice: You can reset your password only if you have verified your email.</p>
            </div>
        );
    }
}
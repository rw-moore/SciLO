import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Col, Divider, Input, message, Row } from 'antd';
import {UserAvatarUpload} from "../Users/UserAvatarUpload";
import API from "../../networks/Endpoints";
import DeleteAvatar from "../../networks/DeleteAvatar";
import PatchUser from "../../networks/PatchUser";
import PutAvatar from "../../networks/PutAvatar";
import SendEmailCaptcha from "../../networks/SendEmailCaptcha";
import VerifyEmailCaptcha from "../../networks/VerifyEmailCaptcha";

/**
 * Update a user's information in user panel
 */
class UserInfoUpdateForm extends React.Component {
    state = {
        confirmDirty: false,
        autoCompleteResult: [],
    };

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
                        if (this.state.avatar) {
                            this.PutAvatar();
                        }
                        else {
                            this.setState({avatar: null, loading: false});
                            this.props.refresh();
                        }
                    }
                });
            }
        });
    };

    setAvatar = (avatar) => {
        this.setState({avatar: avatar})
    };

    deleteAvatar = () => {
        const user = this.props.user ? this.props.user : {};
        if (user.id) {
            DeleteAvatar(user.id, this.props.token).then( data => {
                if (!data || data.status !== 200) {
                    message.error(`Cannot delete avatar of ${this.props.name}, see browser console for more details.`);
                    this.setState({
                        loading: false
                    })
                }
                else {
                    this.setState({avatar: null, loading: false});
                    this.props.refresh();
                }
            });
        }
    };

    PutAvatar = () => {
        const user = this.props.user ? this.props.user : {};
        if (user.id) {
            PutAvatar(user.id, this.state.avatar, this.props.token).then( data => {
                if (!data || data.status !== 200) {
                    message.error(`Cannot upload avatar of ${this.props.name}, see browser console for more details.`);
                    this.setState({
                        loading: false
                    })
                }
                else {
                    this.setState({avatar: null, loading: false});
                    this.props.refresh();
                }
            });
        }
    };

    /* Request the server to send captcha email */
    sendEmailCaptcha = () => {
        this.setState({loadingEmailCaptcha: true});
        SendEmailCaptcha(this.props.token).then(data => {
            if (!data || data.status !== 200) {
                if (data.status >= 400) {
                    message.error(`Cannot send email verification captcha, see browser console for more details.`);
                }
                else {
                    message.error(data.data.message);
                }
                this.setState({
                    loadingEmailCaptcha: false
                })
            }
            else {
                this.setState({sentEmail: true, loadingEmailCaptcha: false});
                setTimeout(()=>{
                    this.setState({sentEmail: false});
                }, 60000);
            }
        });
    };

    /* Send the input captcha to server and verify */
    verifiedEmail = () => {
        this.setState({loadingEmailCaptcha: true});
        const info = {
            code: this.state.emailCaptcha,
            username: this.props.user.username
        };
        VerifyEmailCaptcha(info).then(data => {
            if (!data || data.status !== 200) {
                if (data.status > 400) {
                    message.error(`Cannot send email verification captcha, see browser console for more details.`);
                }
                else {
                    message.error(data.data.message);
                }
                this.setState({
                    loadingEmailCaptcha: false
                })
            }
            else {
                this.setState({emailCaptcha:null, sentEmail: false, loadingEmailCaptcha: false});
                message.success("Email verified!");
                this.props.refresh();
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const user = this.props.user ? this.props.user: {};

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
                <Form.Item
                    label="Email"
                    extra={this.props.user.email_active ? "Your Email has been verified" : "We must make sure that your email can be verified."}
                >
                    <Row gutter={8}>
                        <Col span={12}>
                            {this.props.user.email}
                        </Col>
                        {!this.props.user.email_active &&
                            <div>
                                <Col span={2}/>
                                <Col span={10}>
                                    <Input.Search
                                        value={this.state.emailCaptcha}
                                        enterButton={
                                            <Button
                                                //disabled={this.state.sentEmail && !this.state.emailCaptcha}
                                                loading={this.state.loadingEmailCaptcha}
                                            >
                                                {this.state.sentEmail || this.state.emailCaptcha ? "Verify email" : "Get captcha"}
                                            </Button>
                                        }
                                        onChange={(e)=>{this.setState({emailCaptcha: e.target.value})}}
                                        onSearch={()=>{
                                            if (this.state.emailCaptcha) {
                                                this.verifiedEmail();
                                            }
                                            else {
                                                this.sendEmailCaptcha();
                                            }
                                        }}
                                    />
                                </Col>
                            </div>
                        }
                    </Row>
                </Form.Item>
                <Divider/>
                <Form.Item label="First Name">
                    {getFieldDecorator('first_name', 
                        {
                            initialValue: user.first_name
                        })(<Input />)
                    }
                </Form.Item>
                <Form.Item label="Last Name">
                    {getFieldDecorator('last_name', 
                        {
                            initialValue: user.last_name
                        })(<Input />)
                    }
                </Form.Item>
                <Form.Item label="Institute">
                    {getFieldDecorator('institute', 
                        {
                            initialValue: user.institute
                        })(<Input />)
                    }
                </Form.Item>
                {/*<Form.Item label="Captcha" extra="We must make sure that your are a human.">*/}
                    {/*<Row gutter={8}>*/}
                        {/*<Col span={12}>*/}
                            {/*{getFieldDecorator('captcha', {*/}
                                {/*rules: [{ required: true, message: 'Please input the captcha you got!' }],*/}
                            {/*})(<Input />)}*/}
                        {/*</Col>*/}
                        {/*<Col span={12}>*/}
                            {/*<Button>Get captcha</Button>*/}
                        {/*</Col>*/}
                    {/*</Row>*/}
                {/*</Form.Item>*/}
                <Form.Item label="Avatar">
                    <span style={{display: "inline"}}>
                        <UserAvatarUpload
                            url={user.avatar ? API.domain+ user.avatar : undefined}
                            setAvatar={this.setAvatar}
                            image={this.state.avatar}
                        />
                        <Button type="link" icon={<DeleteOutlined />} onClick={this.deleteAvatar} >Reset</Button>
                    </span>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Update
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({ name: 'register' })(UserInfoUpdateForm);
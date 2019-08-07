import React from 'react';
import {
    Form,
    Input,
    Tooltip,
    Icon,
    Cascader,
    Select,
    Row,
    Col,
    Checkbox,
    Button,
    AutoComplete,
    Upload, message
} from 'antd';
import {UserAvatarUpload} from "../Users/UserAvatarUpload";
import PostUser from "../../networks/PostUser";
import UserLogin from "../../networks/UserLogin";
import {withRouter} from "react-router-dom";
import CheckUsername from "../../networks/CheckUsername";

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;

class RegisterForm extends React.Component {
    state = {
        confirmDirty: false,
        autoCompleteResult: [],
        avatar: undefined
    };

    setAvatar = (avatar) => {
        this.setState({avatar: avatar})
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (this.state.avatar) {
                values.avatar = this.state.avatar;
            }
            if (!err) {
                console.log('Received values of form: ', values);
                PostUser(values).then(data => {
                    if (!data || data.status !== 200) {
                        data = data.data;
                        const msg = data.errors ? "" : "See console for more details.";
                        message.error(`Submit failed. ${msg}`);
                        if (data.errors && data.errors.password) {
                            this.props.form.setFields({
                                password: {
                                    value: values.password,
                                    errors: [new Error(data.errors.password.join(" "))],
                                },
                            });
                        }
                    } else {
                        UserLogin({username: data.data.user.username, password: values.password}).then(data => {
                            if (!data || data.status !== 200) {
                                message.error("Could not login, see console for more details.");
                            } else {
                                this.props.setUser(data.data);
                                this.props.history.replace("/User");
                            }
                        })
                    }
                });
            }
        });
    };

    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    validateUsername = (rule, value, callback) => {
        CheckUsername(value, callback);
    };

    normFile = e => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { autoCompleteResult } = this.state;

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
                <Form.Item label="User Name">
                    {getFieldDecorator('username', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your user name.',
                            },
                            {
                                validator: this.validateUsername
                            }
                        ],
                        validateFirst: true,
                        validateTrigger: "onBlur"
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="E-mail">
                    {getFieldDecorator('email', {
                        rules: [
                            {
                                required: true,
                                message: 'Please enter your email!',
                            },
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail.',
                            },
                        ],
                    })(<Input />)}
                </Form.Item>
                <Form.Item label="Password" hasFeedback>
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                            {
                                validator: this.validateToNextPassword,
                            },
                        ],
                    })(<Input.Password />)}
                </Form.Item>
                <Form.Item label="Confirm Password" hasFeedback>
                    {getFieldDecorator('confirm', {
                        rules: [
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            {
                                validator: this.compareToFirstPassword,
                            },
                        ],
                    })(<Input.Password onBlur={this.handleConfirmBlur} />)}
                </Form.Item>
                <Form.Item label="First Name">
                    {getFieldDecorator('first_name', {})(<Input />)}
                </Form.Item>
                <Form.Item label="Last Name">
                    {getFieldDecorator('last_name', {})(<Input />)}
                </Form.Item>
                <Form.Item label="Institute">
                    {getFieldDecorator('institute', {})(<Input />)}
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
                    <UserAvatarUpload image={this.state.avatar} setAvatar={this.setAvatar}/>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    {getFieldDecorator('agreement', {
                        valuePropName: 'checked',
                        rules: [
                            {
                                validator: (rule, value, callback) => {
                                    if (!value) {callback("Please accept the agreement!")}
                                    else {
                                        callback();
                                    }
                                }
                            }
                        ]
                    })(
                        <Checkbox>
                            I have read the <a href="">agreement</a>
                        </Checkbox>,
                    )}
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

 export default withRouter(Form.create({ name: 'register' })(RegisterForm));
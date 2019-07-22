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
    Upload
} from 'antd';
import {UserAvatarUpload} from "../Users/UserAvatarUpload";

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;

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
                <Form.Item label="First Name">
                    {getFieldDecorator('first_name', {})(<Input />)}
                </Form.Item>
                <Form.Item label="Last Name">
                    {getFieldDecorator('last_name', {})(<Input />)}
                </Form.Item>
                <Form.Item label="E-mail">
                    {getFieldDecorator('email', {
                        rules: [
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail.',
                            },
                        ],
                    })(<Input />)}
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
                    <UserAvatarUpload/>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    {getFieldDecorator('agreement', {
                        valuePropName: 'checked',
                    })(
                        <Checkbox>
                            I have read the <a href="">agreement</a>
                        </Checkbox>,
                    )}
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
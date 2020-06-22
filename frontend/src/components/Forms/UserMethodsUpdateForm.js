import React from 'react';
import {Button, Form, message, Switch} from 'antd';
import PatchUser from "../../networks/PatchUser";


class UserMethodsUpdateForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                PatchUser(this.props.user.id, {'authmethods': values}, this.props.token).then( data => {
                    if (!data || data.status !== 200) {
                        message.error(`Cannot update profile of ${this.props.name}, see console for more details.`);
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
                {Object.entries(this.props.user.authmethods).map(method => (
                    <Form.Item label={method[0]} key={method[0]}>
                        {getFieldDecorator(method[0], {
                            initialValue: method[1],
                            valuePropName: 'checked'
                        })(<Switch />)}
                    </Form.Item>
                ))}

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
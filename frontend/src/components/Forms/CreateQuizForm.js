import {Button, Form, Input, DatePicker} from "antd";
import React from "react";

class CreateQuizForm extends React.Component {

    handleSubmit = e => {
        e.preventDefault();

        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }

            // Should format date value before submit.
            const rangeTimeValue = fieldsValue['start-end-time'];
            const values = {
                ...fieldsValue,
                'start-end-time': [
                    rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss'),
                    rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss'),
                ],
            };
            console.log('Received values of form: ', values);
        });
    };

    render() {
        const TextArea = Input.TextArea;
        const { MonthPicker, RangePicker } = DatePicker;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const { getFieldDecorator } = this.props.form;

        const rangeConfig = {
            rules: [{ type: 'array', required: true, message: 'Please select time!' }],
        };

        return (
            <Form>
                <Form.Item
                    required
                    label="Title"
                    {...formItemLayout}
                >
                    {getFieldDecorator('title', {
                        rules: [{ required: true, message: 'Please enter a title for the quiz!' }],
                    })(
                        <Input placeholder="enter a title" />
                    )}
                </Form.Item>
                <Form.Item
                    required
                    label="Start / End Time"
                    {...formItemLayout}

                >
                    {getFieldDecorator('start-end-time', rangeConfig)(
                        <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{width: "100%"}}/>,
                    )}
                </Form.Item>
                <Button onClick={this.handleSubmit}/>
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuizForm' })(CreateQuizForm);
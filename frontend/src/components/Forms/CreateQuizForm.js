import {Button, Form, Input, DatePicker, Divider, Tooltip} from "antd";
import React from "react";

const timeFormat = "YYYY-MM-DD HH:mm:ss";

class CreateQuizForm extends React.Component {

    handleSubmit = e => {
        e.preventDefault();

        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }

            // Should format date value before submit.
            const rangeTimeValue = fieldsValue['start-end-time'];
            const lateTimeValue = fieldsValue['late-time'];
            const values = {
                ...fieldsValue,
                'start-end-time': [
                    rangeTimeValue[0].format(timeFormat),
                    rangeTimeValue[1].format(timeFormat),
                ],
                'late-time': lateTimeValue.format(timeFormat)
            };
            console.log('Received values of form: ', values);
        });
    };

    /* make sure we have the late submission time later than the end time */
    validateLateTime = (rule, value, callback) => {
        if (value) {
            const timeRange = this.props.form.getFieldValue("start-end-time");
            if (timeRange && timeRange[1]) {
                const end = timeRange[1];
                if (!value.isAfter(end)) {
                    callback("Oops, you have the late submission time earlier than the end time.");
                }
            }
        }
        callback()
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
                        <RangePicker showTime format={timeFormat} style={{width: "100%"}}/>,
                    )}
                </Form.Item>
                <Form.Item
                    label={<Tooltip title={"Students can submit after the deadline"}>Late Submission</Tooltip>}
                    {...formItemLayout}
                >
                    {getFieldDecorator('late-time',{
                        rules: [
                            { validator: this.validateLateTime}
                        ],
                    })(
                        <DatePicker showTime format={timeFormat} style={{width: "100%"}}/>,
                    )}
                </Form.Item>
                <Divider dashed orientation="left">Questions</Divider>
                <Divider dashed orientation="left">Settings</Divider>

                <Button onClick={this.handleSubmit}/>
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuizForm' })(CreateQuizForm);
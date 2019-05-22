import React from "react";

import {Form, Input, Icon, Button, Select, Divider} from 'antd';
import tags from "../../mocks/Tags";

let id = 0;

class CreateQuestionForm extends React.Component {
    remove = k => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { keys, names } = values;
                console.log('Received values of form: ', values);
                console.log('Merged values:', keys.map(key => names[key]));
            }
        });
    };

    render() {
        const { TextArea } = Input;
        const { getFieldDecorator, getFieldValue } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const buttonItemLayout = {
            wrapperCol: { span: 14, offset: 4 },
        };
        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <>
                <Divider/>
                <Form.Item
                    {...formItemLayout}
                    label={"new response " + k}
                    required={false}
                    key={k}
                >
                    {getFieldDecorator(`names[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [
                            {
                                required: true,
                                whitespace: true,
                                message: "Enter the correct answer.",
                            },
                        ],
                    })(<Input placeholder="correct answer" style={{ width: '60%', marginRight: 8 }} />)}
                    {keys.length > 1 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            onClick={() => this.remove(k)}
                        />
                    ) : null}
                </Form.Item>
            </>

        ));


        return (
            <Form>
                <Form.Item required label="Title" {...formItemLayout}>
                    <Input placeholder="enter a title" />
                </Form.Item>
                <Form.Item label="Background" {...formItemLayout}>
                    <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="description of the question" />
                </Form.Item>
                <Form.Item label="Tags" {...formItemLayout}>
                    <Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                        {tags}
                    </Select>
                </Form.Item>
                <Divider/>
                {formItems}
                <Form.Item {...formItemLayoutWithoutLabel}>
                    <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add field
                    </Button>
                </Form.Item>
                <Divider/>
                <Form.Item {...buttonItemLayout}>
                    <Button type="primary" onClick={this.handleSubmit}>Submit</Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
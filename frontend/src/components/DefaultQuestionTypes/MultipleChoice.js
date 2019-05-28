import React from "react";

import {
    Form,
    Input,
    Icon,
    Button,
    Select,
    Divider,
    Card,
    Radio,
    Checkbox,
    Col,
    InputNumber,
    Switch,
    Tooltip
} from 'antd';
import tags from "../../mocks/Tags";
import theme from "../../config/theme"

let id = 0;

/**
 * Multiple Choice form template
 */
class MultipleChoice extends React.Component {
    remove = k => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');

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
                <Form.Item
                    {...formItemLayout}
                    label={"choice " + k}
                    required={false}
                    key={k}
                >
                    {getFieldDecorator(`names[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [
                            {
                                required: true,
                                whitespace: true,
                                message: "Cannot have empty body choice.",
                            },
                        ],
                    })(<Input placeholder="choice content" style={{ width: '60%', marginRight: 8 }} />)}
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                    />
                    <Col>
                        Grade
                        <InputNumber
                            defaultValue={k===0?100:0}
                            formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')}
                        />
                    </Col>

                </Form.Item>
            </>

        ));


        return (
            <Form>
                <Card
                    title={this.props.title}
                    type="inner"
                    size="small"
                    bodyStyle={{backgroundColor: theme["@white"]}}
                    extra={
                        <Icon type="delete" onClick={this.props.remove}/>
                    }
                >
                <Form.Item label="Text" {...formItemLayout}>
                    <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="description of this response" />
                </Form.Item>
                <Divider />
                {formItems}
                <Form.Item {...formItemLayoutWithoutLabel}>
                    <Button type="default" icon="plus" onClick={this.add}>
                        Add choice
                    </Button>
                    <Tooltip title="Use a dropdown menu for rendering (useful when having many options)">
                    <Switch style={{float: "right"}} checkedChildren="Dropdown" unCheckedChildren="Selection" />
                    </Tooltip>
                </Form.Item>
                </Card>
            </Form>
        );
    }
}

export default Form.create({ name: 'MultipleChoice' })(MultipleChoice);
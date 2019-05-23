import React from "react";

import {Form, Input, Icon, Button, Select, Divider, Modal, Radio, Card} from 'antd';
import tags from "../../mocks/Tags";
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import InputField from "../DefaultQuestionTypes/InputField";
import theme from "../../config/theme";

let id = 0;

class CreateQuestionForm extends React.Component {
    state = {
        typeOfComponentToAdd: undefined,
        pairs: {}
    };


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
        const pairs = this.state.pairs;
        pairs[id] = this.state.typeOfComponentToAdd;
        const nextKeys = keys.concat(id);
        id++;
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });

        this.setState({pairs})
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

    onSelectComponentChange = e => {
        console.log('radio checked', e);
        this.setState({
            typeOfComponentToAdd: e,
        });
    };

    addComponent = () => {
        const Option = Select.Option;

        const group = <Select
            showSearch
            onChange={this.onSelectComponentChange}
            style={{ width: 200 }}
            placeholder="Select a person"
            optionFilterProp="children"
            filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            <Option value="input">Input Field</Option>
            <Option value="multiple">Multiple Choice</Option>
            <Option value="custom">Custom Templates</Option>
        </Select>;

        this.addModal = Modal.confirm({
            title: 'Select a Component',
            content: group,
            okText: 'OK',
            cancelText: 'Cancel',
            onOk: args => {
                this.addModal.destroy();
                this.add();
            }
        });
    }


    render() {
        const { TextArea } = Input;
        const { getFieldDecorator, getFieldValue, getFieldsValue } = this.props.form;

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
        const pairs = this.state.pairs;

        const formItems = keys.map((k, index) => {
            switch (pairs[k]) {
                case "input":
                    return (<InputField title={"Input Field "+ k} remove={()=>{this.remove(k)}}/>);
                case "multiple":
                    return (<MultipleChoice title={"Multiple Choice "+k} remove={()=>{this.remove(k)}}/>);
                default:
                    return (<Card
                        title={"Custom Template " + k}
                        type="inner"
                        size="small"
                        bodyStyle={{backgroundColor: theme["@white"]}}
                        extra={
                            <Icon type="delete" onClick={()=>{this.remove(k)}}/>
                        }>Some custom templates</Card>)
            }
        });

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
                    <Button type="dashed" onClick={this.addComponent} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add New Component
                    </Button>
                </Form.Item>
                <Divider/>
                <Form.Item>
                    <Button type="primary">Save</Button>
                    <Button type="default" style={{float: "right"}} onClick={this.handleSubmit}>Submit</Button>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
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
        pairs: {},
        responses: []
    };


    remove = k => {
        // can use data-binding to get
        const responses = this.state.responses;

        // can use data-binding to set
        this.setState({
            responses: responses.filter(key => key !== k),
        });
    };

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const responses = this.state.responses;
        const pairs = this.state.pairs;
        pairs[id] = this.state.typeOfComponentToAdd;

        const nextKeys = responses.concat(id);
        id++;
        // can use data-binding to set
        // important! notify form to detect changes

        this.setState({pairs: pairs, responses: nextKeys})
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    };

    onSelectComponentChange = e => {
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
            placeholder="Select a template"
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
            title: 'Add Response',
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
        const pairs = this.state.pairs;

        const formItems = this.state.responses.map((k, index) => {
            switch (pairs[k]) {
                case "input":
                    return (<InputField id={k} key={k} form={this.props.form} title={"Input Field "+ k} remove={()=>{this.remove(k)}}/>);
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
                    {getFieldDecorator('title', {
                        rules: [{ required: true, message: 'Please enter a title for the question!' }],
                    })(
                        <Input placeholder="enter a title" />
                    )}
                </Form.Item>
                <Form.Item label="Text" {...formItemLayout}>
                    {getFieldDecorator('text', {})(
                        <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="description of the question" />
                    )}
                </Form.Item>
                <Form.Item label="Tags" {...formItemLayout}>
                    {getFieldDecorator('tags', {})(
                        <Select placeholder="select tags" mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                            {tags}
                        </Select>
                    )}
                </Form.Item>
                <Divider/>
                {formItems}
                <Form.Item {...formItemLayoutWithoutLabel}>
                    <Button type="dashed" onClick={this.addComponent} style={{ width: '100%' }}>
                        <Icon type="plus" /> Add New Response
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
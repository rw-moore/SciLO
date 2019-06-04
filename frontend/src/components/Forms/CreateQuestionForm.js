import React from "react";

import {Form, Input, Icon, Button, Select, Divider, Modal, Radio, Card} from 'antd';
import tags from "../../mocks/Tags";
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import InputField from "../DefaultQuestionTypes/InputField";
import theme from "../../config/theme";
import CreateVariableModal from  "../Variables/CreateVariableModal"

let id = 0;

class CreateQuestionForm extends React.Component {
    state = {
        typeOfComponentToAdd: undefined,
        showVariableModal: false,
        responses: []
    };

    randomID = () => {
      return Math.random().toString(36).substr(2, 9)
    };


    remove = k => {
        // can use data-binding to get
        let responses = this.state.responses;
        console.log(k, responses);
        responses = responses.filter(r=>r.key!==k);

        // can use data-binding to set
        this.setState({
            responses
        });

    };

    add = () => {
        const { form } = this.props;
        // can use data-binding to get
        const responses = this.state.responses;

        const nextKeys = responses.concat({
            key: this.randomID(),
            type: this.state.typeOfComponentToAdd,
            answerOrder: []
        });
        id++;
        // can use data-binding to set
        // important! notify form to detect changes

        this.setState({responses: nextKeys})
    };

    swap = (i, j) => {
        const responses = this.state.responses;
        if (j < 0 || j >= responses.length) {
            return
        }
        [responses[i], responses[j]] = [responses[j], responses[i]];
        this.setState({responses});
    };

    changeOrder = (k, newOrder) => {
        let responses = this.state.responses;
        responses.forEach((r)=>{
            if (r.key===k) {
                r.answerOrder = newOrder
            }
        });
        // can use data-binding to set
        this.setState({
            responses
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                console.log('Received values of form: ', values);
                console.log("Json", JSON.stringify(values));
                this.props.preview(values);
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
    };

    parseTags = (tags) => {
        if (tags) {
            return tags.map(tag => ({name: tag}));
        }
    };

    sortResponses = (responses) => {
        const index = (key) => (this.state.responses.map(item => item.key).indexOf(key));

        console.log(responses);
        if (!responses) {
            return
        }
        responses = Object.entries(responses);
        responses.forEach(item => {
            if (!item[1].answers) {return}
            console.log(this.state.responses[index(item[0])].answerOrder);
            const answerIndex = (answerID) => (this.state.responses[index(item[0])].answerOrder.indexOf(answerID));
            item[1].answers = Object.entries(item[1].answers);
            item[1].answers.sort((a,b) => (answerIndex(a[0]) > answerIndex(b[0])) ? 1 : -1);
            item[1].answers = item[1].answers.map((item)=>(item[1]));
        });

        responses.sort((a,b) => (index(a[0]) > index(b[0])) ? 1 : -1);

        return responses.map((item)=>(item[1]));
    };


    render() {
        const { TextArea } = Input;
        const ButtonGroup = Button.Group;
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
            switch (k.type) {
                case "input":
                    return (
                        <InputField
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"Input Field "+ index}
                            remove={()=>{this.remove(k.key)}}
                            changeOrder={(order)=>{this.changeOrder(k.key, order)}}
                        />);
                case "multiple":
                    return (
                        <MultipleChoice
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"Multiple Choice "+ index}
                            remove={()=>{this.remove(k.key)}}
                            changeOrder={(order)=>{this.changeOrder(k.key, order)}}
                        />);
                default:
                    return (<Card
                        title={"Custom Template " + k.key}
                        type="inner"
                        size="small"
                        bodyStyle={{backgroundColor: theme["@white"]}}
                        extra={
                            <Icon type="delete" onClick={()=>{this.remove(k.key)}}/>
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
                    <ButtonGroup style={{width: "100%"}}>
                        <Button style={{width: "50%"}} type="primary" icon="plus" onClick={this.addComponent}>New Response</Button>
                        <Button style={{width: "50%"}} type="default" icon="number" onClick={()=>{this.setState({showVariableModal: true})}}>New Variable</Button>
                    </ButtonGroup>
                </Form.Item>
                <Divider/>
                <Form.Item>
                    <Button type="primary">Save</Button>
                    <Button type="default" style={{float: "right"}} onClick={this.handleSubmit}>Submit</Button>
                </Form.Item>
                <CreateVariableModal visible={this.state.showVariableModal} close={()=>{this.setState({showVariableModal: false})}}/>
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
import React from "react";

import {Form, Input, Icon, Button, Select, Divider, Modal, Card} from 'antd';
import tags from "../../mocks/Tags";
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import InputField from "../DefaultQuestionTypes/InputField";
import theme from "../../config/theme";
import CreateVariableModal from  "../Variables/CreateVariableModal"
import randomID from "../../utils/RandomID"
import PostQuestion from "../../networks/PostQuestion";

class CreateQuestionForm extends React.Component {

    state = {
        typeOfResponseToAdd: undefined,
        showVariableModal: false,
        responses: []
    };

    /* remove a response with id:k */
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

    /* add a new response */
    add = () => {
        const responses = this.state.responses;

        const nextKeys = responses.concat({
            key: randomID(),
            type: this.state.typeOfResponseToAdd,
            answerOrder: []
        });
        this.setState({responses: nextKeys})
    };

    /* swap two responses order with id i and j */
    swap = (i, j) => {
        const responses = this.state.responses;
        if (j < 0 || j >= responses.length) {
            return
        }
        [responses[i], responses[j]] = [responses[j], responses[i]];
        this.setState({responses});
    };

    /* change order of the answers in the response with id:k */
    changeOrder = (k, newOrder) => {
        let responses = this.state.responses;
        responses.forEach((r)=>{
            if (r.key===k) {
                r.answerOrder = newOrder
            }
        });
        this.setState({
            responses
        });
    };

    getFormValues = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                console.log('Received values of form: ', values);
                console.log("Json", JSON.stringify(values));
                return values;
            }
        });
    }

    /* triggered when the submit button is clicked */
    handleSubmit = e => {
        e.preventDefault();
        const values = this.getFormValues();
        PostQuestion(JSON.stringify(values));
        this.props.preview(values);
    };

    /* triggered when the preview button is clicked */
    handlePreview = e => {
        e.preventDefault();
        const values = this.getFormValues();
        this.props.preview(values);
    };

    /* OnChange function of selection in the add a response modal */
    onSelectComponentChange = e => {
        this.setState({
            typeOfResponseToAdd: e,
        });
    };

    /* render function of adding a response */
    addComponent = () => {
        const Option = Select.Option;

        // select component which is used to choose a response type
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

        // show the modal
        this.addModal = Modal.confirm({
            title: 'Add Response',
            content: group,
            okText: 'OK',
            cancelText: 'Cancel',
            onOk: () => {
                this.addModal.destroy();
                this.add();
            }
        });
    };

    /* post processing of the tags information */
    parseTags = (tags) => {
        if (tags) {
            return tags.map(tag => ({name: tag}));
        }
    };

    /* sort the responses by their ids matching the order */
    sortResponses = (responses) => {
        const index = (key) => (this.state.responses.map(item => item.key).indexOf(key));

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
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        // render the responses
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
                <Form.Item
                    required
                    label="Title"
                    {...formItemLayout}
                >
                    {getFieldDecorator('title', {
                        rules: [{ required: true, message: 'Please enter a title for the question!' }],
                    })(
                        <Input placeholder="enter a title" />
                    )}
                </Form.Item>
                <Form.Item
                    label="Text"
                    {...formItemLayout}
                >
                    {getFieldDecorator('text', {})(
                        <TextArea
                            autosize={{ minRows: 2, maxRows: 6 }}
                            placeholder="description of the question"
                        />
                    )}
                </Form.Item>
                <Form.Item
                    label="Tags"
                    {...formItemLayout}
                >
                    {getFieldDecorator('tags', {})(
                        <Select
                            placeholder="select tags"
                            mode="tags"
                            style={{ width: '100%' }}
                            tokenSeparators={[',']}
                        >
                            {tags}
                        </Select>
                    )}
                </Form.Item>
                <Divider/>
                {formItems}
                <Form.Item {...formItemLayoutWithoutLabel}>
                    <ButtonGroup style={{width: "100%"}}>
                        <Button
                            style={{width: "50%"}}
                            type="primary"
                            icon="plus"
                            onClick={this.addComponent}
                        >
                            New Response
                        </Button>
                        <Button
                            style={{width: "50%"}}
                            type="default"
                            icon="number"
                            onClick={()=>{this.setState({showVariableModal: true})}}
                        >
                            New Variable
                        </Button>
                    </ButtonGroup>
                </Form.Item>
                <Divider/>
                <Form.Item>
                    <Button type="primary" onClick={this.handlePreview}>
                        Preview
                    </Button>
                    <Button
                        type="default"
                        style={{float: "right"}}
                        onClick={this.handleSubmit}
                    >
                        Submit
                    </Button>
                </Form.Item>
                <CreateVariableModal
                    visible={this.state.showVariableModal}
                    close={()=>{this.setState({showVariableModal: false})}}
                />
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
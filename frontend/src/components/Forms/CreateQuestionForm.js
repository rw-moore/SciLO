import React from "react";

import {Button, Card, Divider, Form, Icon, Input, message, Modal, Radio, Select} from 'antd';
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import InputField from "../DefaultQuestionTypes/InputField";
import theme from "../../config/theme";
import randomID from "../../utils/RandomID"
import PostQuestion from "../../networks/PostQuestion";
import PutQuestion from "../../networks/PutQuestion";
import GetTagsSelectBar from "./GetTagsSelectBar";
import GetCourseSelectBar from "./GetCourseSelectBar";
import SagePlayground from "../DefaultQuestionTypes/SagePlayground";
import XmlEditor from "../Editor/XmlEditor";
import DecisionTreeInput from "../DefaultQuestionTypes/DecisionTreeInput";
import {CodeEditor} from "../CodeEditor";

/**
 * Create/modify a question
 */
class CreateQuestionForm extends React.Component {

    state = {
        typeOfResponseToAdd: undefined,
        script: this.props.question && this.props.question.variables ? this.props.question.variables.value : undefined,
        language: this.props.question && this.props.question.variables ? this.props.question.variables.language : "sage",
        tree: this.props.question && this.props.question.tree ? this.props.question.tree : undefined,
        responses: this.props.question ? this.props.question.responses.map(response => ({
            identifier: response.identifier,
            key: response.id.toString(),
            type: response.type.name,
            answerOrder: Object.keys(response.answers)
        })) : []
    };

    /* load question */
    componentDidMount() {
        if (this.props.question) {
            this.props.form.setFieldsValue({
                title: this.props.question.title,
                text: this.props.question.text,
                tags: this.props.question.tags.map(tag => tag.name)
            })
        }
    }

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

    /* triggered when the submit button is clicked */
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.variables = this.state.script?{type:"script",language:this.state.language,value:this.state.script}:undefined;
                values.tree = this.state.tree;
                values.tree.name = 'tree';
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                console.log('Received values of form: ', values);
                console.log("Json", JSON.stringify(values));
                if (this.props.question) {
                    PutQuestion(this.props.question.id, JSON.stringify(values), this.props.token).then(data => {
                        if (!data || data.status !== 200) {
                            message.error("Submit failed, see console for more details.");
                            console.error(data);
                        }
                        else {
                            this.props.goBack();
                        }
                    });
                }
                else {
                    PostQuestion(JSON.stringify(values), this.props.token).then(data => {
                        if (!data || data.status !== 200) {
                            message.error("Submit failed, see console for more details.");
                            console.error(data);
                        }
                        else {
                            this.props.goBack();
                        }
                    });
                }
            }
        });
    };

    /* triggered when the preview button is clicked */
    handlePreview = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.variables = this.state.script?{type:"script",language:this.state.language,value:this.state.script}:undefined;
                values.tree = this.state.tree;
                values.tree.name = 'tree';
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                console.log('Received values of form: ', values);
                console.log("Json", JSON.stringify(values));
                this.props.preview(values);
                return values;
            }
        });
    };

    /* OnChange function of selection in the add a response modal */
    onSelectComponentChange = e => {
        console.log(e);
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
            <Option value="tree">Input Field</Option>
            <Option value="multiple">Multiple Choice</Option>
            {/* <Option value="tree">Input with Decision Tree</Option> */}
            <Option value="sagecell">SageCell Embedded</Option>
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
            console.log(item[0],index(item[0]));
            console.log(this.state.responses,this.state.responses[index(item[0])].answerOrder);
            const answerIndex = (answerID) => (this.state.responses[index(item[0])].answerOrder.indexOf(answerID));
            item[1].answers = Object.entries(item[1].answers);
            item[1].answers.sort((a,b) => (answerIndex(a[0]) > answerIndex(b[0])) ? 1 : -1);
            item[1].answers = item[1].answers.map((item)=>(item[1]));
        });

        responses.sort((a,b) => (index(a[0]) > index(b[0])) ? 1 : -1);

        return responses.map((item)=>(item[1]));
    };


    render() {
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
                case "multiple":
                    return (
                        <MultipleChoice
                            fetched={this.props.question && this.props.question.responses[index] ? this.props.question.responses[index] : {}}
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
                case "sagecell":
                    return (
                        <SagePlayground
                            fetched={(this.props.question && this.props.question.responses[index]) ? this.props.question.responses[index] : {}}
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"SageCell "+ index}
                            remove={()=>{this.remove(k.key)}}
                            changeOrder={(order)=>{this.changeOrder(k.key, order)}}
                        />);
                case "tree":
                    return (
                        <InputField
                            fetched={this.props.question && this.props.question.responses[index] ? this.props.question.responses[index] : {}}
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
                    {getFieldDecorator('text', {
                        getValueProps: (value) => value ? value.code: "",  // necessary
                    })(
                        <XmlEditor />
                    )}
                </Form.Item>

                <GetTagsSelectBar form={this.props.form} token={this.props.token}/>

                {((!this.props.question) || this.props.question.course) &&
                    <GetCourseSelectBar
                        form={this.props.form}
                        token={this.props.token}
                        value={this.props.question ? this.props.question.course : this.props.course}
                        allowEmpty={true}
                    />
                }

                <Form.Item
                    label="Question Script"
                    {...formItemLayout}
                >
                    <span>
                        <Radio.Group value={this.state.language} onChange={(value)=>this.setState({language: value.target.value})} defaultValue="sage" size={"small"}>
                            <Radio.Button value="sage">Python</Radio.Button>
                            <Radio.Button value="maxima">Maxima</Radio.Button>
                        </Radio.Group>
                    </span>
                    <CodeEditor value={this.state.script} onChange={(value)=>this.setState({script: value})}/>
                </Form.Item>
                
                <Form.Item
                    label="Question Tree"
                    {...formItemLayout}
                >
                    <DecisionTreeInput
                        fetched={this.props.question ? this.props.question : {}}
                        form={this.props.form}
                        id={this.props.question && this.props.question.id}
                        title={"Decision Tree For Question"}
                        onChange={(value)=>this.setState({tree:value})}
                    />
                </Form.Item>

                <Divider/>
                {formItems}
                <Form.Item {...formItemLayoutWithoutLabel}>
                    <Button
                        style={{width: "100%"}}
                        type="primary"
                        icon="plus"
                        onClick={this.addComponent}
                    >
                        New Response
                    </Button>
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
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
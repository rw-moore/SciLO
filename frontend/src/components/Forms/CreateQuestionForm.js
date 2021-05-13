import React from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Button,
    Card,
    Col,
    Divider,
    Input,
    InputNumber,
    message,
    Modal,
    Radio,
    Row,
    Select,
} from 'antd';
import moment from "moment";
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
import QuestionImages from "./QuestionImages";

const timeFormat = "YYYY-MM-DD HH:mm:ss";

/**
 * Create/modify a question
 */
class CreateQuestionForm extends React.Component {

    state = {
        typeOfResponseToAdd: undefined,
        script: this.props.question && this.props.question.variables ? this.props.question.variables.value : undefined,
        language: this.props.question && this.props.question.variables ? this.props.question.variables.language : "sage",
        tree: this.props.question && this.props.question.tree ? this.props.question.tree : {},
        mark: this.props.question && this.props.question.mark ? this.props.question.mark : 0,
        responses: this.props.question ? this.props.question.responses.map(response => ({
            id: response.id,
            identifier: response.identifier,
            key: response.id.toString(),
            type: {name: response.type.name},
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
        let idx = responses.findIndex(r=>r.key===k);
        let resp = responses.splice(idx, 1)[0];
        // console.log(resp);
        if (resp.type.name === "multiple") {
            let tree = this.state.tree;
            const removeNode = function(tree, ident) {
                if (tree.children) {
                    for (var i=tree.children.length-1; i>=0; i--) {
                        if (tree.children[i].identifier === ident) {
                            tree.children.splice(i, 1);
                        } else {
                            tree.children[i] = removeNode(tree.children[i], ident);
                        }
                    }
                }
                return tree;
            }
            tree = removeNode(tree, resp.identifier);
            this.setState({
                tree
            });
        }
        // console.log(responses);
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
            type: {name: this.state.typeOfResponseToAdd},
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
        let respi = this.props.form.getFieldValue(`responses[${i}]`);
        let respj = this.props.form.getFieldValue(`responses[${j}]`);
        this.setState({responses}, () => {
            this.props.form.resetFields([`responses[${i}]`, `responses[${j}]`]);
            this.props.form.setFieldsValue({
                [`responses[${i}]`]: respj,
                [`responses[${j}]`]: respi
            });
        });
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

    /* change identifier in state so the tree can find it */
    changeIdentifier = (k, newIdentifier) => {
        let responses = this.state.responses;
        let resp = responses.find(r=>r.key === k);
        let oldIdentifier = resp.identifier;
        resp.identifier = newIdentifier;
        if (resp.type.name === "multiple") {
            let tree = this.state.tree;
            const updateTree = function(tree, oldId, newId) {
                if (tree.children) {
                    for (var i=tree.children.length-1; i>=0; i--) {
                        if (tree.children[i].identifier === oldId) {
                            tree.children[i].identifier = newId;
                        } else {
                            tree.children[i] = updateTree(tree.children[i], oldId, newId);
                        }
                    }
                }
                return tree;
            }
            tree = updateTree(tree, oldIdentifier, newIdentifier);
            this.setState({tree});
        }
        this.setState({
            responses: responses
        });
    }

    /* triggered when the submit button is clicked */
    handleSubmit = (e, returnToQB) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.variables = {
                    type:"script",
                    language:this.state.language||"sage",
                    value:this.state.script||''
                }
                values.tree = this.state.tree || {};
                values.tree.name = 'tree';
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                values.last_modify_date = moment().format(timeFormat);
                console.log('Received values of form: ', values);
                console.log("Json", JSON.stringify(values));
                if (this.props.question) {
                    PutQuestion(this.props.question.id, JSON.stringify(values), this.props.token).then(data => {
                        if (!data || data.status !== 200) {
                            message.error("Submit failed, see browser console for more details.");
                            console.error(data);
                        } else {
                            if (returnToQB){
                                this.props.goBack();
                            } else {
                                message.success("Question was saved successfully.");
                                this.props.fetch(()=>{
                                    const responses = this.props.question.responses;

                                    responses.forEach(resp=> {
                                        resp.key = resp.id.toString();
                                        resp.answerOrder = Object.keys(resp.answers);
                                    })
                                    this.setState({
                                        responses: responses
                                    });
                                });
                            }
                        }
                    });
                } else {
                    values.create_date = moment().format(timeFormat);
                    PostQuestion(JSON.stringify(values), this.props.token).then(data => {
                        if (!data || data.status !== 200) {
                            message.error("Submit failed, see browser console for more details.");
                            console.error(data);
                        } else {
                            if (returnToQB){
                                this.props.goBack();
                            } else {
                                message.success("Question was saved successfully.");
                                this.props.fetch(()=>{
                                    const responses = this.props.question.responses;

                                    responses.forEach(resp=> {
                                        resp.key = resp.id.toString();
                                        resp.answerOrder = Object.keys(resp.answers);
                                    })
                                    this.setState({
                                        responses: responses
                                    });
                                });
                            }
                        }
                    });
                }
            } else {
                console.log(err);
            }
        });
    };

    /* triggered when the preview button is clicked */
    handlePreview = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.variables = {
                    type:"script",
                    language:this.state.language||"sage",
                    value:this.state.script||''
                }
                values.tree = this.state.tree || {};
                values.tree.name = 'tree';
                values.tags = this.parseTags(values.tags);
                values.responses = this.sortResponses(values.responses);
                console.log('Received values of form: ', values);
                // console.log("Json", JSON.stringify(values));
                this.props.updatePreview(values);
                return values;
            }
        });
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
            <Option value="tree">Input Field</Option>
            <Option value="multiple">Multiple Choice</Option>
            {/* <Option value="sagecell">SageCell Embedded</Option> */}
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
        // console.log('sortresp', responses);
        // console.log(this.state.responses);
        // const index = (key) => {
        //     const arr = this.state.responses.map(item => item.index);
        //     return arr.indexOf(key)
        // };

        if (!responses) {
            return
        }
        // console.log('sort passed');
        responses = Object.entries(responses);
        responses.forEach(item => {
            // console.log('sort mid1', item);
            if (!item[1].answers) {return}
            // console.log('sort mid');
            const answerIndex = (answerID) => (this.state.responses[item[0]].answerOrder.indexOf(answerID));
            item[1].answers = Object.entries(item[1].answers);
            item[1].answers.sort((a,b) => (answerIndex(a[0]) > answerIndex(b[0])) ? 1 : -1);
            item[1].answers = item[1].answers.map((item)=>(item[1]));
            // console.log('sort mid end');
        });
        responses.sort((a,b) => (a[0] > b[0]) ? 1 : -1);
        let out = responses.map((item=>(item[1])));
        // console.log('sort end');
        return out
    };

    /* make sure we have free attempt number fewer than total attempts */
    validateFreeAttempts = (rule, value, callback) => {
        if (value!=="") {
            const attempts = this.props.form.getFieldValue(`grade_policy.max_tries`);
            if (attempts!=="" && attempts!==0 && attempts < value) {
                callback(false);
            }
        }
        callback()
    };

    /* make sure we have free attempt number fewer than total attempts */
    validateMaxAttempts = (rule, value, callback) => {
        if (value!=="" && value!==0) {
            const free = this.props.form.getFieldValue(`grade_policy.free_tries`);
            if (free!=="" && free > value) {
                callback(false);
            }
        }
        callback()
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
            // console.log(k, index)
            switch (k.type.name) {
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
                            changeIndentifier={(ident)=>{this.changeIdentifier(k.key, ident)}}
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
                            changeIndentifier={(ident)=>{this.changeIdentifier(k.key, ident)}}
                        />);
                default:
                    return (
                        <Card
                            title={"Custom Template " + k.key}
                            key={k.key}
                            type="inner"
                            size="small"
                            bodyStyle={{backgroundColor: theme["@white"]}}
                            extra={
                                <DeleteOutlined onClick={()=>{this.remove(k.key)}} />
                            }
                        >Some custom templates
                        </Card>
                    );
            }
        });
        return (
            <div style={{ padding: 22, background: '#fff', height: "89vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                <h1>{this.props.question ? "Edit Question" : "New Question"} {!this.props.preview && this.props.previewIcon} </h1>
                <Form>
                        <Form.Item
                            required
                            label="Title"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('title', 
                                {
                                    rules: [{ required: true, message: 'Please enter a title for the question!' }],
                                })(<Input placeholder="enter a title" />)
                            }
                        </Form.Item>
                        <Form.Item
                            label="Text"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('text', 
                                {
                                    getValueProps: (value) => value ? value.code: "",  // necessary
                                })(<XmlEditor />)
                            }
                        </Form.Item>

                        <GetTagsSelectBar form={this.props.form} token={this.props.token}/>

                        <GetCourseSelectBar
                            form={this.props.form}
                            token={this.props.token}
                            value={this.props.question ? this.props.question.course : this.props.course}
                            allowEmpty={true}
                        />

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
                            <CodeEditor value={this.state.script} language={this.state.language} onChange={(value)=>this.setState({script: value})}/>
                        </Form.Item>
                        
                        <Form.Item
                            label="Question Tree"
                            {...formItemLayout}
                        >
                            <DecisionTreeInput
                                tree={this.state.tree}
                                responses={this.state.responses}
                                form={this.props.form}
                                id={this.props.question && this.props.question.id}
                                title={"Decision Tree For Question"}
                                onChange={(value)=>this.setState({tree:value})}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Question Images"
                            {...formItemLayout}
                        >
                            <QuestionImages
                                id={this.props.question && this.props.question.id}
                            ></QuestionImages>
                        </Form.Item>
                        <Divider/>
                        {formItems}
                        <Form.Item {...formItemLayoutWithoutLabel}>
                            <Button
                                style={{width: "100%"}}
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={this.addComponent}
                            >
                                New Response
                            </Button>
                        </Form.Item>
                        <Divider/>
                        <Row>
                            <Col span={4}/>
                            <Col span={7}>
                                <Form.Item label="Tries">
                                    {getFieldDecorator(`grade_policy.max_tries`,
                                        { 
                                            initialValue : this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.max_tries : 1,
                                            rules: [{
                                                validator: this.validateMaxAttempts,
                                                message: "Oops, you have more free tries than the total number of tries."
                                            }]
                                        })(<InputNumber min={0} max={10}/>)
                                    }
                                </Form.Item>
                                <span hidden={this.props.form.getFieldValue(`grade_policy.max_tries`)!==0} style={{color:"orange"}}>
                                    User will have unlimited tries.
                                </span>
                            </Col>
                            <Col span={7}>
                                <Form.Item label="Deduction per Try">
                                    {getFieldDecorator(`grade_policy.penalty_per_try`,
                                        { 
                                            initialValue : this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.penalty_per_try : 20
                                        })(
                                            <InputNumber
                                                min={0}
                                                max={100}
                                                formatter={value => `${value}%`}
                                                parser={value => value.replace('%', '')}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Free Tries">
                                    {getFieldDecorator(`grade_policy.free_tries`,
                                        {
                                            initialValue : this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.free_tries : 1,
                                            rules: [{
                                                validator: this.validateFreeAttempts,
                                                message: "Oops, you have more free tries than the total number of tries."
                                            }]
                                        })(<InputNumber min={1} max={10} />)
                                    }
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider/>
                    </Form>
                <Row style={{position:"fixed", bottom:"0", padding:10, background:"#EEE", height:"auto", width:"calc(100% - 70px)", zIndex:1}}>
                    <Col span={12} style={{float:"left"}}>
                        <Button type="primary" onClick={this.handlePreview}>
                            Preview
                        </Button>
                    </Col>
                    <Col span={12} style={{float:"right"}}>
                        {this.props.question && 
                            <Button
                                style={{float:"right"}}
                                type="default"
                                onClick={(e) => this.handleSubmit(e, false)}
                            >
                                Save and Continue
                            </Button>
                        }
                        <Button
                            style={{float:"right"}}
                            type="default"
                            onClick={(e) => this.handleSubmit(e, true)}
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Form.create({ name: 'CreateQuestionForm' })(CreateQuestionForm);
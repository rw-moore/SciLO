import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Collapse, Divider, Form, Input, InputNumber, message, Modal, Radio, Row, Select, Switch, Tooltip } from 'antd';
import moment from "moment";
import React from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import theme from "../../config/theme";
import PostQuestion from "../../networks/PostQuestion";
import PutQuestion from "../../networks/PutQuestion";
import PutQuestionImages from "../../networks/PutQuestionImages";
import randomID from "../../utils/RandomID";
import { CodeEditor } from "../CodeEditor";
import { calculateMark } from "../DecisionTree/index";
import DecisionTreeInput from "../DefaultQuestionTypes/DecisionTreeInput";
import InputField from "../DefaultQuestionTypes/InputField";
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import SagePlayground from "../DefaultQuestionTypes/SagePlayground";
import XmlEditor from "../Editor/XmlEditor";
import GetCourseSelectBar from "./GetCourseSelectBar";
import GetTagsSelectBar from "./GetTagsSelectBar";
import QuestionImages from "./QuestionImages";

const timeFormat = "YYYY-MM-DD HH:mm:ss";

/**
 * Create/modify a question
 */
function CreateQuestionForm(props) {
    const [form] = Form.useForm();
    return <CreateQuestionFormF {...props} form={form} />
}
export default CreateQuestionForm;
class CreateQuestionFormF extends React.Component {

    state = {
        desc_as_title: this.props.question && this.props.question.desc_as_title ? this.props.question.desc_as_title : false,
        typeOfResponseToAdd: undefined,
        script: this.props.question && this.props.question.variables ? this.props.question.variables.value : undefined,
        language: this.props.question && this.props.question.variables ? this.props.question.variables.language : "sage",
        tree: this.props.question && this.props.question.tree ? this.props.question.tree : {},
        mark: this.props.question && this.props.question.mark ? this.props.question.mark : 0,
        triesWarning: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.max_tries===0 : false,
        responses: this.props.question && this.props.question.responses ? this.props.question.responses.map(response => ({
            ...response, 
            key: response.id.toString(),
            answerOrder: Object.keys(response.answers)
        })) : [],
        images: this.props.images || [],
        activeKeys: [],
    };

    /* load question */
    componentDidMount() {
        console.log('mount form1', this.props.form.getFieldsValue(true));
        if (this.props.question && this.props.question.id) {
            console.log('has question')
            this.props.form.setFieldsValue({
                tags: this.props.question.tags.map(tag => tag.name),
                course: this.props.question.course?`${this.props.question.course}`:undefined
            });
        } else {
            this.props.form.setFieldsValue({
                course: this.props.course?`${this.props.course}`:undefined
            });
        }
        console.log('mount form2', this.props.form.getFieldsValue(true));
    }

    /* remove a response with id:k */
    remove = k => {
        // can use data-binding to get
        let responses = this.state.responses;
        let idx = responses.findIndex(r=>r.key===k);
        let resp = responses.splice(idx, 1)[0];
        let tree = this.state.tree;
        // console.log(resp);
        if (resp.type.name === "multiple") {
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
        }
        this.setState({
            tree,
            responses
        }, ()=> {
            let formData = this.props.form.getFieldsValue();
            formData.responses = responses;
            this.props.form.setFieldsValue(formData);
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
        const newResp = this.state.typeOfResponseToAdd;
        const index = nextKeys.length;
        this.setState({responses: nextKeys}, ()=>{
            let formData = this.props.form.getFieldsValue();
            if (newResp === "tree") {
                formData.responses[index-1] = {
                    text: "",
                    identifier: "",
                    patterntype: "Custom",
                    pattern: '',
                    patternflag: '',
                    patternfeedback: '',
                    type: {
                        label: "Answer",
                        name: "tree"
                    }
                };
            } else if (newResp === "multiple") {
                formData.responses[index-1] = {
                    answers: [],
                    text: "",
                    identifier: "",
                    mark: 1,
                    type: {
                        shuffle: true,
                        single: true,
                        dropdown: false,
                        name: "multiple"
                    }
                };
            } else if (newResp === "sagecell") {
                formData.responses[index-1] = {
                    text: "",
                    identifier: "",
                    type: {
                        language: undefined,
                        code: undefined,
                        src: undefined,
                        params: {
                            hide: ["editor", "fullScreen", "language", "evalButton", "permalink", "done", "sessionFiles", "messages", "sessionTitle"],
                            evalButtonText: "Evaluate",
                            replaceOutput: true,
                            autoeval: true,
                        },
                        inheritScript: false,
                        name: "sagecell"
                    },
                    mark: 0
                }
            }
            this.props.form.setFieldsValue(formData);
        })
    };

    /* swap two responses order with id i and j */
    swap = (i, j) => {
        console.log('swap');
        const responses = this.state.responses;
        if (j < 0 || j >= responses.length) {
            return
        }
        [responses[i], responses[j]] = [responses[j], responses[i]];
        let respi = this.props.form.getFieldValue([`responses`, i]);
        let respj = this.props.form.getFieldValue([`responses`, j]);
        this.setState({responses}, () => {
            this.props.form.resetFields([
                [`responses`, i], [`responses`, j]
            ]);
            let newArr = [];
            newArr[i] = respj;
            newArr[j] = respi;
            this.props.form.setFieldsValue({
                responses: newArr
            });
        });
    };

    /* change order of the answers in the response with id:k */
    changeOrder = (k, new_responses, cb) => {
        console.log('change order')
        let responses = this.state.responses;
        let index;
        responses.forEach((r, i)=>{
            if (r.key===k) {
                r.answerOrder = Object.keys(new_responses[i].answers)
                index = i;
            }
        });
        this.setState({
            responses
        }, ()=> {
            this.props.form.setFieldsValue(new_responses);
            this.props.form.validateFields([["responses", index, "answers"]]).then(values => {
                console.log('changeOrder', values);
            }).catch(err => {
                console.error('changeOrder', err);
            });
        });
    };

    /* change identifier in state so the tree can find it */
    changeIdentifier = (k, newIdentifier) => {
        console.log('change ident');
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
    afterSubmitQuestion = (data, returnToQB) => {
        if (!data || data.status !== 200) {
            message.error("Submit failed, see browser console for more details.");
            console.error(data);
        } else {
            //PUT images to /api/questions/{data.question.id}/images
            // console.log('after', data);
            // console.log(this.state.images);
            PutQuestionImages(data.data.question.id, this.state.images, this.props.token).then(image_data=> {
                if (!image_data || image_data.status !== 200) {
                    message.error("Image submission failed, see browser console for more details.");
                    console.error(image_data);
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
    }
    confirmSubmit = (values, returnToQB) => {
        if (this.props.question && this.props.question.id) {
            PutQuestion(this.props.question.id, values, this.props.token).then(data=>this.afterSubmitQuestion(data, returnToQB));
        } else {
            values.create_date = moment().format(timeFormat);
            PostQuestion(values, this.props.token).then(data=>this.afterSubmitQuestion(data, returnToQB));
        }
    }
    /* triggered when the submit button is clicked */
    handleSubmit = (e, returnToQB) => {
        e.preventDefault();
        this.props.form.validateFields().then(values => {
            values.variables = {
                type:"script",
                language:this.state.language||"sage",
                value:this.state.script||''
            }
            values.tree = this.state.tree || {};
            values.tree.name = 'tree';
            values.tags = this.parseTags(values.tags);
            values.responses = this.sortResponses(values.responses);
            // values.desc_as_title = this.state.desc_as_title;
            values.last_modify_date = moment().format(timeFormat);
            console.log('Received values of form: ', values);
            // console.log("Json", JSON.stringify(values));
            const total_mark = calculateMark(this.state.tree, values.responses.reduce(function(map, obj){
                map[obj.identifier] = obj;
                return map;
            }, {}), this.props.form);
            if (((total_mark.true && total_mark.true.max<=0) || total_mark.max <= 0) && returnToQB) {
                Modal.confirm({
                    title: 'Are you sure you want to finish?',
                    icon: <ExclamationCircleOutlined/>,
                    content: "The maximum score achievable on this question is 0. Are you sure your want to proceed?",
                    okText: "Yes",
                    onOk: () => {
                        this.confirmSubmit(values, returnToQB);
                    }
                })
            } else {
                this.confirmSubmit(values, returnToQB);
            }
        }).catch(err => {
            console.error(err);
        });
    };

    /* triggered when the preview button is clicked */
    handlePreview = e => {
        e.preventDefault();
        this.props.form.validateFields().then(values => {
            values.variables = {
                type:"script",
                language:this.state.language||"sage",
                value:this.state.script||''
            }
            values.tree = this.state.tree || {};
            values.tree.name = 'tree';
            values.tags = this.parseTags(values.tags);
            values.responses = this.sortResponses(values.responses);
            values.desc_as_title = this.state.desc_as_title;
            console.log('Received values of form: ', values);
            // console.log("Json", JSON.stringify(values));
            this.props.updatePreview(values, this.state.images);
            return values;
        }).catch(err => {
            console.error(err);
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
        // console.log('sortresp', responses);
        // console.log(this.state.responses);
        // const index = (key) => {
        //     const arr = this.state.responses.map(item => item.index);
        //     return arr.indexOf(key)
        // };

        if (!responses) {
            return []
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

    toggleCollapse = () => {
        if (this.state.activeKeys.length > 0) {
            // Collapse all
            this.setState({activeKeys: []});
        } else { 
            // Expand All
            this.setState({activeKeys: this.state.responses.map(r=>r.key.toString())})
        }
    };

    maxTriesValidator = (formInstance) => {
        const validator = (_, value) => {
            if (value!=="" && value!==0) {
                this.setState({triesWarning: false})
                const free = formInstance.getFieldValue([`grade_policy`,`free_tries`]);
                if (free!=="" && free > value) {
                    return Promise.reject(new Error("Oops, you have more free tries than the total number of tries."));
                }
            } else if (value === 0) {
                this.setState({triesWarning: true});
            }
            return Promise.resolve();
        }
        return {
            validator
        }
    };

    render() {

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const defaults = {
            descriptor: this.props.question && this.props.question.descriptor,
            title: this.props.question && this.props.question.title,
            desc_as_title: this.props.question && this.props.question.desc_as_title,
            text: this.props.question && this.props.question.text,
            grade_policy: {
                max_tries: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.max_tries : 1,
                penalty_per_try: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.penalty_per_try : 0,
                free_tries: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.free_tries : 1
            },
            responses: []
        }

        // render the responses
        const formItems = this.state.responses.map((k, index) => {
            const exists = this.props.question && this.props.question.responses && this.props.question.responses[index];
            // console.log(k, index)
            switch (k.type.name) {
                case "multiple":
                    console.log('mult choice formitems', k);
                    defaults.responses[index] = {
                        answers: exists ? this.props.question.responses[index].answers : [],
                        text: exists ? this.props.question.responses[index].text : "",
                        identifier: exists ? this.props.question.responses[index].identifier : "",
                        mark: exists && this.props.question.responses[index].mark ? this.props.question.responses[index].mark : 1,
                        type: {
                            shuffle: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.shuffle : true,
                            single: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.single : true,
                            dropdown: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.dropdown : false,
                            name: "multiple"
                        },
                        id: exists && this.props.question.responses[index].id
                    }
                    return (
                        <MultipleChoice
                            fetched={exists ? this.state.responses[index] : {}}
                            images={this.state.images}
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"Multiple Choice "+ (index+1)}
                            remove={()=>{this.remove(k.key)}}
                            changeOrder={(order)=>{this.changeOrder(k.key, order)}}
                            changeIndentifier={(ident)=>{this.changeIdentifier(k.key, ident)}}
                        />);
                case "tree":
                    defaults.responses[index] = {
                        text: exists ? this.props.question.responses[index].text : "",
                        identifier: exists ? this.props.question.responses[index].identifier : "",
                        patterntype: exists && this.props.question.responses[index].patterntype?this.props.question.responses[index].patterntype:"Custom",
                        pattern: exists && this.props.question.responses[index].pattern ? this.props.question.responses[index].pattern : '',
                        patternflag: exists && this.props.question.responses[index].patternflag ? this.props.question.responses[index].patternflag : '',
                        patternfeedback: exists && this.props.question.responses[index].patternfeedback ? this.props.question.responses[index].patternfeedback : '',
                        type: {
                            label: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.label : "Answer",
                            name: "tree"
                        },
                        id: exists && this.props.question.responses[index].id
                    }
                    return (
                        <InputField
                            fetched={exists ? this.state.responses[index] : {}}
                            images={this.state.images}
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"Input Field "+ (index+1)}
                            remove={()=>{this.remove(k.key)}}
                            changeIndentifier={(ident)=>{this.changeIdentifier(k.key, ident)}}
                        />);
                case "sagecell":
                    defaults.responses[index] = {
                        text: exists ? this.props.question.responses[index].text : "",
                        identifier: exists ? this.props.question.responses[index].identifier : "",
                        type: {
                            language: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.language : undefined,
                            code: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.code: undefined,
                            src: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.src: undefined,
                            params: {
                                hide: exists && this.props.question.responses[index].type && this.props.question.responses[index].type.params ? this.props.question.responses[index].type.params.hide : ["editor", "fullScreen", "language", "evalButton", "permalink", "done", "sessionFiles", "messages", "sessionTitle"],
                                evalButtonText: exists && this.props.question.responses[index].type && this.props.question.responses[index].type.params ? this.props.question.responses[index].type.params.evalButtonText : "Evaluate",
                                replaceOutput: exists && this.props.question.responses[index].type && this.props.question.responses[index].type.params ? this.props.question.responses[index].type.params.replaceOutput : true,
                                autoeval: exists && this.props.question.responses[index].type && this.props.question.responses[index].type.params ? this.props.question.responses[index].type.params.autoeval : true,

                            },
                            inheritScript: exists && this.props.question.responses[index].type ? this.props.question.responses[index].type.inheritScript : false,
                            name: "sagecell"
                        },
                        mark: exists && this.props.question.responses[index].mark,
                        id: exists && this.props.question.responses[index].id
                    }
                    return (
                        <SagePlayground
                            fetched={(this.props.question && this.props.question.responses[index]) ? this.props.question.responses[index] : {}}
                            images={this.state.images}
                            up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
                            down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
                            id={k.key}
                            key={k.key}
                            index={index}
                            form={this.props.form}
                            title={"SageCell "+ (index+1)}
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
                <h1>{this.props.question && this.props.question.id ? "Edit Question" : "New Question"} {!this.props.preview && this.props.previewIcon} </h1>
                <DndProvider backend={HTML5Backend}>
                    <Form
                        form={this.props.form}
                        initialValues={defaults}
                        labelWrap={true}
                    >
                        <Form.Item
                            label={"Descriptor"}
                            tooltip={{title:"Descriptor identifies this quesiton in the Questionbank (not shown to students).", trigger:"click"}}
                            {...formItemLayout}
                            name='descriptor'
                            rules={ [{ required: true, message: 'Please enter a descriptor for the question!' }]}
                        >
                            <Input placeholder='Enter the descriptor to identify the question in the Questionbank.'/>
                        </Form.Item>
                        <Form.Item
                            label={"Title"}
                            tooltip={{title:"Within a Quiz the student sees the title as a headline of the question. (Optional)", trigger:"click"}}
                            {...formItemLayout}
                            name='title'
                        >
                            <Input disabled={this.state.desc_as_title} placeholder="Enter a title to be displayed to the student. (Optional)" />
                        </Form.Item>
                        <Form.Item
                            label={"Use descriptor as the title"}
                            tooltip={{title:(<span>If this is checked then the descriptor will be shown in the Questionbank <strong>and</strong> to students in quizzes.</span>), trigger:"click"}}
                            // wrapperCol={{offset: 4, span: 20}}
                            {...formItemLayout}
                            name="desc_as_title"
                            valuePropName='checked'
                        >
                            <Switch 
                                // onChange={()=>{this.setState({desc_as_title: !this.state.desc_as_title})}}
                                // checked={this.state.desc_as_title}
                            >
                            </Switch>
                        </Form.Item>
                        <Form.Item
                            label="Text"
                            {...formItemLayout}
                            name="text"
                            getValueProps = {value => value ? value.code: ""} // necessary
                        >
                            <XmlEditor initialValue={this.props.question && this.props.question.text}/>
                        </Form.Item>

                        <GetTagsSelectBar form={this.props.form} token={this.props.token}/>

                        <GetCourseSelectBar
                            form={this.props.form}
                            token={this.props.token}
                            value={this.props.course ? this.props.course : this.props.question.course}
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
                            label="Evaluation Tree"
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
                                images={this.state.images}
                                updateState={(value)=>this.setState({images:value})}
                            />
                        </Form.Item>

                        <Divider/>

                        <Button onClick={this.toggleCollapse}>
                            {this.state.activeKeys.length > 0 ? "Collapse all": "Expand All"}
                        </Button>

                        <Collapse activeKey={this.state.activeKeys} onChange={(new_val)=>this.setState({activeKeys: new_val})}>
                            {formItems}
                        </Collapse>

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
                            <Col span={7} offset={4}>
                                <span>Tries:</span>
                            </Col>
                            <Col span={7}>
                                <span>Deduction per Try:</span>
                            </Col>
                            <Col span={6}>
                                <span>Free Tries:</span>
                            </Col>
                        </Row>

                        <Row style={{marginTop:16}}>
                            <Col span={7} offset={4}>
                                <Form.Item
                                    name={["grade_policy", "max_tries"]}
                                    dependencies={[["grade_policy", "free_tries"]]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "You must input a number."
                                        },
                                        this.maxTriesValidator
                                    ]}
                                >
                                    <InputNumber min={0} max={10}/>
                                </Form.Item>
                                <span hidden={!this.state.triesWarning} style={{color:"orange"}}>
                                    User will have unlimited tries.
                                </span>
                            </Col>
                            <Col span={7}>
                                <Form.Item 
                                    name={["grade_policy", "penalty_per_try"]}
                                >
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        formatter={value => `${value}%`}
                                        parser={value => value.replace('%', '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={["grade_policy", "free_tries"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "You must input a number."
                                        },
                                    ]}
                                >
                                    <InputNumber min={1} max={10} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider/>
                    </Form>
                </DndProvider>
                {/* zIndex is 5 because Ace editor gutter zIndex is 4 */}
                <Row style={{position:"fixed", bottom:"0", padding:10, background:"#EEE", height:"auto", width:"calc(100% - 70px)", zIndex:5}}>
                    <Col span={12} style={{float:"left"}}>
                        <Button type="primary" onClick={this.handlePreview}>
                            Preview
                        </Button>
                    </Col>
                    <Col span={12} style={{float:"right"}}>
                        {this.props.question && this.props.question.id && 
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

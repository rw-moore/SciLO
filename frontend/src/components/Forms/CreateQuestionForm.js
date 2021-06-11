import React from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Radio,
    Row,
    Select,
} from 'antd';
import moment from "moment";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MultipleChoice from "../DefaultQuestionTypes/MultipleChoice";
import InputField from "../DefaultQuestionTypes/InputField";
import theme from "../../config/theme";
import randomID from "../../utils/RandomID"
import PostQuestion from "../../networks/PostQuestion";
import PutQuestion from "../../networks/PutQuestion";
import PutQuestionImages from "../../networks/PutQuestionImages";
import GetTagsSelectBar from "./GetTagsSelectBar";
import GetCourseSelectBar from "./GetCourseSelectBar";
import SagePlayground from "../DefaultQuestionTypes/SagePlayground";
import XmlEditor from "../Editor/XmlEditor";
import DecisionTreeInput from "../DefaultQuestionTypes/DecisionTreeInput";
import {CodeEditor} from "../CodeEditor";
import QuestionImages from "./QuestionImages";
import { calculateMark } from "../DecisionTree/index";

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
        typeOfResponseToAdd: undefined,
        script: this.props.question && this.props.question.variables ? this.props.question.variables.value : undefined,
        language: this.props.question && this.props.question.variables ? this.props.question.variables.language : "sage",
        tree: this.props.question && this.props.question.tree ? this.props.question.tree : {},
        mark: this.props.question && this.props.question.mark ? this.props.question.mark : 0,
        triesWarning: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.max_tries===0 : false,
        responses: this.props.question && this.props.question.responses ? this.props.question.responses.map(response => ({
            id: response.id,
            identifier: response.identifier,
            key: response.id.toString(),
            type: {name: response.type.name},
            answerOrder: Object.keys(response.answers)
        })) : [],
        images: this.props.images || []
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
            console.log('after', data);
            console.log(this.state.images);
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
            values.last_modify_date = moment().format(timeFormat);
            console.log('Received values of form: ', values);
            // console.log("Json", JSON.stringify(values));
            const total_mark = calculateMark(this.state.tree, values.responses.reduce(function(map, obj){
                map[obj.identifier] = obj;
                return map;
            }, {}), this.props.form);
            if ((total_mark.true && total_mark.true.max<=0) || total_mark.max <= 0) {
                message.error("Maximum mark for the question is 0.");
            }else if (this.props.question && this.props.question.id) {
                PutQuestion(this.props.question.id, values, this.props.token).then(data=>this.afterSubmitQuestion(data, returnToQB));
            } else {
                values.create_date = moment().format(timeFormat);
                PostQuestion(values, this.props.token).then(data=>this.afterSubmitQuestion(data, returnToQB));
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
    }

    render() {

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const defaults = {
            title: this.props.question && this.props.question.title,
            text: this.props.question && this.props.question.text,
            grade_policy: {
                max_tries: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.max_tries : 1,
                penalty_per_try: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.penalty_per_try : 20,
                free_tries: this.props.question && this.props.question.grade_policy ? this.props.question.grade_policy.free_tries : 1
            },
            responses: []
        }

        // render the responses
        const formItems = this.state.responses.map((k, index) => {
            // console.log(k, index)
            switch (k.type.name) {
                case "multiple":
                    defaults.responses[index] = {
                        answers: this.props.question.responses[index].answers || [],
                        text: this.props.question.responses[index].text || "",
                        identifier: this.props.question.responses[index].identifier || "",
                        mark: this.props.question.responses[index].mark ? this.props.question.responses[index].mark : 1,
                        type: {
                            shuffle: this.props.question.responses[index].type ? this.props.question.responses[index].type.shuffle : true,
                            single: this.props.question.responses[index].type ? this.props.question.responses[index].type.single : true,
                            dropdown: this.props.question.responses[index].type ? this.props.question.responses[index].type.dropdown : false,
                            name: "multiple"
                        },
                        id: this.props.question.responses[index].id
                    }
                    return (
                        <MultipleChoice
                            fetched={this.props.question && this.props.question.responses[index] ? this.props.question.responses[index] : {}}
                            images={this.state.images}
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
                case "tree":
                    defaults.responses[index] = {
                        text: this.props.question.responses[index].text || "",
                        identifier: this.props.question.responses[index].identifier || "",
                        patterntype: this.props.question.responses[index].patterntype?this.props.question.responses[index].patterntype:"Custom",
                        pattern: this.props.question.responses[index].pattern ? this.props.question.responses[index].pattern : '',
                        patternflag: this.props.question.responses[index].patternflag ? this.props.question.responses[index].patternflag : '',
                        patternfeedback: this.props.question.responses[index].patternfeedback ? this.props.question.responses[index].patternfeedback : '',
                        type: {
                            label: this.props.question.responses[index].type ? this.props.question.responses[index].type.label : "Answer",
                            name: "tree"
                        },
                        id: this.props.question.responses[index].id
                    }
                    return (
                        <InputField
                            fetched={this.props.question && this.props.question.responses[index] ? this.props.question.responses[index] : {}}
                            images={this.state.images}
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
    //         case "sagecell":
    //             return (
    //                 <SagePlayground
    //                     fetched={(this.props.question && this.props.question.responses[index]) ? this.props.question.responses[index] : {}}
    //                     up={(event)=>{this.swap(index, index-1); event.stopPropagation();}}
    //                     down={(event)=>{this.swap(index, index+1); event.stopPropagation();}}
    //                     id={k.key}
    //                     key={k.key}
    //                     index={index}
    //                     form={this.formRef.current}
    //                     title={"SageCell "+ index}
    //                     remove={()=>{this.remove(k.key)}}
    //                     changeOrder={(order)=>{this.changeOrder(k.key, order)}}
    //                 />);
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
                    >
                        <Form.Item
                            label="Title"
                            {...formItemLayout}
                            name='title'
                            rules={ [{ required: true, message: 'Please enter a title for the question!' }]}
                        >
                            <Input placeholder="enter a title" />
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
                                images={this.state.images}
                                updateState={(value)=>this.setState({images:value})}
                            />
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
                <Row style={{position:"fixed", bottom:"0", padding:10, background:"#EEE", height:"auto", width:"calc(100% - 70px)", zIndex:1}}>
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

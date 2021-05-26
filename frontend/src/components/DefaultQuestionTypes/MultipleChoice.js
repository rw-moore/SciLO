import React from "react";

import { CaretDownOutlined, CaretUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';

import {
    Button,
    Card,
    Collapse,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Switch,
    Tag,
    Tooltip,
} from 'antd';
import theme from "../../config/theme"
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import randomID from "../../utils/RandomID";
import XmlEditor from "../Editor/XmlEditor";

/**
 * Multiple Choice form template
 */
export default class MultipleChoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answers: (props.fetched && props.fetched.answers) ? Object.keys(props.fetched.answers) : [],
            mark: props.fetched ? props.fetched.mark: 0,
            marks: props.fetched && props.fetched.answers ? props.fetched.answers.map(ans=>ans.grade): []
        };
    }
    componentDidMount = () => {
        (async() => {
            while(this.props.form.current === null) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.props.form.current.validateFields([["responses", this.props.index, "answers"]]).then(values => {
                console.log('mount', values);
            }).catch(err => {
                console.error('mount', err);
            });
        })();
        
    }


    /* remove an answer */
    remove = k => {
        // filter out the answer we do not want
        console.log(k);
        const answers = this.state.answers.filter(key => key !== k);
        console.log(answers);
        this.setState({
            answers
        });
        // re-order the answers
        this.props.changeOrder(answers);
    };

    /* add an answer */
    add = () => {
        const answers = this.state.answers;
        // generate a new id for the new answer
        const nextKeys = answers.concat(randomID());
        this.setState({
            answers: nextKeys
        });
        // re-order the answers
        this.props.changeOrder(nextKeys);
    };

    /* happen when the user has done dragging of the answer card */
    onDragEnd = (result) => {
        // a little function to help us with reordering the result
        const reorder = (list, startIndex, endIndex) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        const answers = reorder(
            this.state.answers,
            result.source.index,
            result.destination.index
        );
        this.setState({
            answers
        });
        // re-order the answers
        this.props.changeOrder(answers);
    };

    getColor = (index) => {
        let grade, max;
        if (this.props.form.current) {
            grade = this.props.form.current.getFieldValue([`responses`,this.props.index,`answers`,index,`grade`]);
            max = this.props.form.current.getFieldValue(`responses`,this.props.index,`mark`);
        } else {
            grade = this.state.marks[index];
            max = this.state.mark;
        }
        if (grade >= max) {
            return "green"
        }
        else if (grade > 0) {
            return "orange"
        }
        else {
            return "magenta"
        }
    };

    gradeValidator = (formInstance) => {
        const validator = (_, _value) => {
            // console.log('validator', _value);
            let single = formInstance.getFieldValue([`responses`,this.props.index, `type`,`single`]);
            // console.log('single', single);
            let max = 0;
            let sum = 0;
            this.state.answers.forEach(k => {
                let grade = formInstance.getFieldValue([`responses`,this.props.index,`answers`,k,`grade`]);
                // console.log('grade '+k, grade);
                if (typeof grade === 'string'){
                    grade = Number(grade.replace('%',''));
                }
                if (grade>0) {
                    sum += grade;
                }
                if (grade>max) {
                    max = grade;
                }
            });
            // console.log(max, sum);
            if (single && (max !== formInstance.getFieldValue([`responses`,this.props.index,`mark`]))) {
                return Promise.reject(new Error('You can\'t achieve 100% on this question.'));
            } else if (!single && (sum !== formInstance.getFieldValue([`responses`,this.props.index,`mark`]))) {
                return Promise.reject(new Error('You can\'t achieve 100% on this question.'));
            }
            return Promise.resolve();
        }
        return {
            validator
        }
    }


    render() {
        const Panel = Collapse.Panel;

        // form layout css
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        // render the answer cards
        const formItems = this.state.answers.map((k, index) => {
            console.log([
                ["responses", this.props.index, "type", "single"],
                ["responses", this.props.index, "mark"],
                ["responses", this.props.index, "answers"],
                ...this.state.answers.map((el, i)=> {
                    if (el !== k) {
                        return ["responses", this.props.index, "answers", el, "grade"];
                    }
                    return null;
                }).filter(a=>a!==null)
            ])
            return (
            // k is the unique id of the answer which created in this.add()
            <Draggable
                key={"drag_"+k}
                draggableId={"drag_"+k}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        key={k}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                    >
                        <Card
                            size={"small"}
                            bordered={snapshot.isDragging}
                            style={{backgroundColor: snapshot.isDragging?"white":theme["@white"]}}
                            {...provided.dragHandleProps}
                        >
                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tag closable onClose={()=>this.remove(k)} color={this.getColor(k)}>
                                        {"Choice " + (index+1)}
                                    </Tag>
                                }
                                required={false}
                                key={k}
                                name={["responses", this.props.index, "answers", k, "text"]}
                                getValueProps={ (value) => value ? value.code: ""}
                                rules={[{
                                        required: true,
                                        whitespace: true,
                                        message: "Cannot have empty body choice.",
                                    }
                                ]}
                            >
                                <XmlEditor initialValue={this.props.fetched.answers[k].text}/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Feedback"
                                name={["responses", this.props.index, "answers", k, "comment"]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Grade"
                                name={["responses", this.props.index, "answers", k, "grade"]}
                                dependencies={[
                                    ["responses", this.props.index, "type", "single"],
                                    ["responses", this.props.index, "mark"],
                                    ["responses", this.props.index],
                                    ...this.state.answers.map((el, i)=> {
                                        if (el !== k) {
                                            return ["responses", this.props.index, "answers", el, "grade"];
                                        }
                                        return null;
                                    }).filter(a=>a!==null)
                                ]}
                                rules={[
                                    this.gradeValidator
                                ]}
                            >
                                <InputNumber/>
                            </Form.Item>
                        </Card>
                    </div>
                )}
            </Draggable>
        )});

        return (
            <Collapse
                defaultActiveKey={[this.props.id]}
                style={{marginBottom: 12}}
            >
                <Panel
                    header={
                        <span>
                            <Tag
                                onClick={this.props.up}
                                style={{marginLeft: 4}}
                            >
                                <CaretUpOutlined />
                            </Tag>
                            <Tag onClick={this.props.down}>
                                <CaretDownOutlined />
                            </Tag>
                            {this.props.title}
                        </span>
                    }
                    key={this.props.id}
                    extra={
                        <DeleteOutlined
                            onClick={() => {
                                Modal.warning({
                                    title: 'Delete',
                                    content: <span>Do you want to delete this field? It will delete any associated nodes and <span style={{color: "red"}}>their children</span> as well.</span>,
                                    onOk: this.props.remove,
                                    okCancel: true
                                });
                            }} />
                    }
                    forceRender
                >
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Form.Item 
                            label="Text" 
                            {...formItemLayout}
                            name={["responses", this.props.index, "text"]}
                            getValueProps={ (value) => value ? value.code: ""}
                        >
                            <XmlEditor initialValue={this.props.fetched.text}/>
                        </Form.Item>
                        <Form.Item 
                            label="Identifier" 
                            {...formItemLayout}
                            name={["responses", this.props.index, "identifier"]}
                            rules={[
                                {required:true, whitespace:true, message:"Identifier cannot be empty."},
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (value) {
                                            let exists = false;
                                            Object.values(getFieldValue(`responses`)).forEach(element => {
                                                if (element.identifier === value) {
                                                    if (exists) {
                                                        return Promise.reject(new Error('All identifiers must be unique.'));
                                                    }
                                                    exists = true;
                                                }
                                            });
                                        }
                                        return Promise.resolve()
                                    }
                                }),
                                {validator: (_, value)=>{this.props.changeIndentifier(value); return Promise.resolve()}},
                            ]}
                            validateFirst= {true}
                        >
                            <Input placeholder="Enter an identifier you want to refer to this response box with"/>
                        </Form.Item>
                        <Droppable droppableId={"drop_"+this.props.id}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {formItems}
                                    {provided.placeholder}
                                </div>
                            )}

                        </Droppable>
                        {(formItems.length !== 0) && <Divider/>}
                        <Button
                            type="default"
                            icon={<PlusOutlined />}
                            onClick={this.add}
                        >
                            Add choice
                        </Button>
                        <div style={{float:"right"}}>
                            <Tooltip
                                title="Should ever shuffle the choices?"
                                arrowPointAtCenter
                            >
                                <Tag>Shufflable</Tag>
                                <Form.Item
                                    noStyle={true}
                                    name={["responses", this.props.index, "type", "shuffle"]}
                                    valuePropName={"checked"}
                                >
                                    <Switch size={"small"}/>
                                </Form.Item>
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="Multiple correct answers?"
                                arrowPointAtCenter
                            >
                                <Tag>Single</Tag>
                                <Form.Item
                                    noStyle={true}
                                    name={["responses", this.props.index, "type", "single"]}
                                    valuePropName={"checked"}
                                >
                                    <Switch size={"small"}/>
                                </Form.Item>
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="Use a dropdown menu for rendering (useful when having many options)"
                                arrowPointAtCenter
                            >
                                <Tag>Dropdown</Tag>
                                <Form.Item
                                    noStyle={true}
                                    name={["responses", this.props.index, "type", "dropdown"]}
                                    valuePropName={"checked"}
                                >
                                    <Switch size={"small"}/>
                                </Form.Item>
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tag>Mark</Tag>
                            <Form.Item
                                noStyle={true}
                                name={["responses", this.props.index, "mark"]}
                            >
                                <InputNumber size="default" min={0} max={100000}/>
                            </Form.Item>
                        </div>
                        {/* storing meta data*/}
                        <span hidden={true}>
                            <Form.Item
                                noStyle={true}
                                name={["responses", this.props.index, "type", "name"]}
                            >
                                <input/>
                            </Form.Item>
                            <Form.Item
                                noStyle={true}
                                name={["responses", this.props.index, "id"]}
                            >
                                <input/>
                            </Form.Item>
                        </span>
                    </DragDropContext>
                </Panel>
            </Collapse>
        );
    }
}
import React from "react";

import {Button, Card, Col, Collapse, Divider, Form, Icon, Input, InputNumber, Modal, Row, Switch, Tag, Tooltip} from 'antd';
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
            answers: (props.fetched && props.fetched.answers) ? Object.keys(props.fetched.answers) : []
        };
    }


    /* remove an answer */
    remove = k => {
        // filter out the answer we do not want
        const answers = this.state.answers.filter(key => key !== k);
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


    /* make sure we have free attempt number fewer than total attempts */
    validateFreeAttempts = (rule, value, callback) => {
        if (value) {
            const attempts = this.props.form.getFieldValue(`responses[${this.props.id}].attempts`);
            if (attempts && attempts < value) {
                callback("Oops, you have more free tries than the total number of attempts.");
            }
        }
        callback()
    };

    /* make sure all identifiers are unique */
    validateIdentifiers = (rule, value, callback) => {
        if (value) {
            let exists = false;
            this.props.form.getFieldValue(`responses`).forEach(element => {
                if (element.identifier === value) {
                    if (exists) {
                        callback('All identifiers must be unique.')
                    }
                    exists = true;
                }
            });
        }
        callback()
    }
    validateAllGrades = (rule, value, callback) => {
        console.log('validate all');
        let fields = [];
        this.state.answers.forEach(k=>{
            fields.push(`responses[${this.props.id}].answers[${k}]`);
        });
        this.props.form.validateFields(fields);
        callback();
    }
    /* make sure the total score possible on the question is 100% */
    validateGrades = (rule, value, callback) => {
        if (value) {
            let single = this.props.form.getFieldValue(`responses[${this.props.id}].type.single`);
            let max = 0;
            let sum = 0;
            this.state.answers.map(k => {
                let grade = this.props.form.getFieldValue(`responses[${this.props.id}].answers[${k}].grade`);
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
            console.log(max, sum);
            if (single && (max!==this.props.form.getFieldValue(`responses[${this.props.id}].mark`))) {
                callback(false);
            } else if (!single && (sum!==this.props.form.getFieldValue(`responses[${this.props.id}].mark`))) {
                callback(false);
            }
        }
        callback();
    }

    getColor = (index) => {
        const grade = this.props.form.getFieldValue(`responses[${this.props.id}].answers[${index}].grade`);
        const max = this.props.form.getFieldValue(`responses[${this.props.id}].mark`);
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

    render() {
        const Panel = Collapse.Panel;
        const { getFieldDecorator } = this.props.form;

        // form layout css
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        // render the answer cards
        const formItems = this.state.answers.map((k, index) => (
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
                            >
                                {getFieldDecorator(`responses[${this.props.id}].answers[${k}].text`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [
                                        {
                                            required: true,
                                            whitespace: true,
                                            message: "Cannot have empty body choice.",
                                        },
                                    ],
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].text : undefined,
                                    getValueProps: (value) => value ? value.code: "",  // necessary
                                })(
                                    <XmlEditor />
                                    )}
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Feedback"
                            >
                                {getFieldDecorator(`responses[${this.props.id}].answers[${k}].comment`, {
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].comment : undefined,
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Grade"
                            >
                                {getFieldDecorator(`responses[${this.props.id}].answers[${k}].grade`, {
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].grade : (index === 0 ? 1 : 0),
                                    rules: [
                                        {
                                            validator: this.validateGrades,
                                            message: 'You can\'t achieve 100% on this question.'
                                        }
                                    ],
                                    validateTrigger: ["onBlur", "onChange"]
                                })(<InputNumber/>)}
                            </Form.Item>
                        </Card>
                    </div>
                )}
            </Draggable>
        ));

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
                            <Icon type="caret-up" />
                        </Tag>
                        <Tag onClick={this.props.down}>
                            <Icon type="caret-down" />
                        </Tag>
                            {this.props.title}
                    </span>
                    }
                    key={this.props.id}
                    extra={
                        <Icon
                            type="delete"
                            onClick={() => {
                                Modal.warning({
                                    title: 'Delete',
                                    content: <span>Do you want to delete this field? It will delete any associated nodes and <span style={{color: "red"}}>their children</span> as well.</span>,
                                    onOk:this.props.remove,
                                    okCancel: true
                                });
                            }}
                        />
                    }
                    forceRender
                >
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Form.Item label="Text" {...formItemLayout}>
                            {getFieldDecorator(`responses[${this.props.id}].text`, {
                                initialValue : this.props.fetched.text,
                                getValueProps: (value) => value ? value.code: "",  // necessary
                            })(
                                <XmlEditor />
                            )}
                        </Form.Item>
                    <Form.Item label="Identifier" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].identifier`, 
                            { 
                                initialValue : this.props.fetched.identifier, 
                                required:true,
                                rules: [
                                    { validator: this.validateIdentifiers, message:"All identifiers should be unique"}
                                ],
                                validateTrigger: ["onBlur", "onChange"]
                            })(
                            <Input placeholder="Enter an identifier you want to refer to this response box with"/>)
                        }
                    </Form.Item>
                        {/* <Row>
                            <Col span={4}/>
                            <Col span={7}>
                                <Form.Item label="Attempts">
                                    {getFieldDecorator(`responses[${this.props.id}].grade_policy.max_tries`,
                                        { initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.max_tries ? this.props.fetched.grade_policy.max_tries : 1})(
                                        <InputNumber
                                            min={0}
                                            max={10}
                                        />)}
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item label="Attempt Deduction">
                                    {getFieldDecorator(`responses[${this.props.id}].grade_policy.penalty_per_try`,
                                        { initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.penalty_per_try ? this.props.fetched.grade_policy.penalty_per_try : 20})(
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                        />)}
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Free Tries">
                                    {getFieldDecorator(`responses[${this.props.id}].grade_policy.free_tries`,
                                        {
                                            initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.free_tries ? this.props.fetched.grade_policy.free_tries : 0,
                                            rules: [
                                                { 
                                                    validator: this.validateFreeAttempts,
                                                }
                                            ]})(
                                        <InputNumber min={0} max={10} />)}
                                </Form.Item>
                            </Col>
                        </Row> */}
                        <Divider />
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
                            icon="plus"
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
                                {getFieldDecorator(`responses[${this.props.id}].type.shuffle`, {
                                    initialValue : this.props.fetched.type ? this.props.fetched.type.initialValue : true,
                                    valuePropName: "checked"})(
                                    <Switch size={"small"}/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="Multiple correct answers?"
                                arrowPointAtCenter
                            >
                                <Tag>Single</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.single`, {
                                    initialValue : this.props.fetched.type ? this.props.fetched.type.single : true,
                                    valuePropName: "checked",
                                    rules: [{
                                        validator:this.validateAllGrades
                                    }]
                                })(
                                    <Switch size={"small"}/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="Use a dropdown menu for rendering (useful when having many options)"
                                arrowPointAtCenter
                            >
                                <Tag>Dropdown</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.dropdown`, {initialValue: this.props.fetched.type ? this.props.fetched.type.dropdown : false,
                                    valuePropName: "checked"})(
                                    <Switch size={"small"}/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tag>Mark</Tag>
                            {getFieldDecorator(`responses[${this.props.id}].mark`,
                                {
                                    initialValue : this.props.fetched.mark ? this.props.fetched.mark : 1,
                                })(
                                <InputNumber size="default" min={0} max={100000} />)}
                        </div>
                        {/* storing meta data*/}
                        <span hidden={true}>
                            {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "multiple"})(<input/>)}
                        </span>
                    </DragDropContext>
                </Panel>
            </Collapse>
        );
    }
}
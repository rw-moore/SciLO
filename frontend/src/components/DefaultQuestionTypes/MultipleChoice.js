import { CaretDownOutlined, CaretUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Divider, Form, Input, InputNumber, Modal, Switch, Tag, Tooltip } from 'antd';
import React from "react";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import theme from "../../config/theme";
import randomID from "../../utils/RandomID";
import XmlEditor from "../Editor/XmlEditor";



/**
 * Multiple Choice form template
 */
export default class MultipleChoice extends React.Component {
    constructor(props) {
        super(props);
        const response = Object.keys(props.fetched).length ? props.fetched : {answers: []};
        response.answers = response.answers.map(ans=>({...ans, uid:randomID()}));
        // console.log('construct', response.answers);
        this.state = {
            response: response,
            answers: (props.fetched && props.fetched.answers) ? Object.keys(props.fetched.answers) : [],
            mark: props.fetched ? props.fetched.mark: 0,
            marks: props.fetched && props.fetched.answers ? props.fetched.answers.map(ans=>ans.grade): []
        };
    }
    updateResponseState = (response, cb) => {
        response.answers = response.answers.map(ans=>({...ans, uid:randomID()}));
        this.setState({
            response: response,
            answers: Object.keys(response.answers),
            mark: response.mark,
            marks: response.answers.map(ans=>ans.grade)
        }, ()=> {
            if (cb) {
                cb();
            }
        });
    }
    componentDidMount = () => {
        this.props.form.validateFields([["responses", this.props.index, "answers"]]).then(values => {
            console.log('mount', values);
        }).catch(err => {
            console.error('mount', err);
        });
    }


    /* remove an answer */
    remove = i => {
        // filter out the answer we do not want
        // console.log('remove', i);
        const responses = this.props.form.getFieldValue("responses");
        responses[this.props.index].answers.splice(i, 1);
        // console.log(responses);
        this.updateResponseState(responses[this.props.index], ()=>this.props.changeOrder(responses));
        // re-order the answers
    };

    /* add an answer */
    add = () => {
        const responses = this.props.form.getFieldValue("responses");
        responses[this.props.index].answers.push({uid:randomID()});
        this.updateResponseState(responses[this.props.index], ()=>this.props.changeOrder(responses));
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
        const old_fields = this.props.form.getFieldValue(["responses", this.props.index, "answers"]);
        // console.log('drag end', old_fields);
        const new_fields = reorder(
            old_fields,
            result.source.index,
            result.destination.index
        );
        // console.log(new_fields);
        const responses = this.props.form.getFieldValue("responses");
        responses[this.props.index].answers = new_fields;
        this.updateResponseState(responses[this.props.index],()=>this.props.changeOrder(responses));
        // re-order the answers
    };

    getColor = (index) => {
        let grade, max;
        if (this.props.form) {
            grade = this.props.form.getFieldValue([`responses`,this.props.index,`answers`,index,`grade`]);
            max = this.props.form.getFieldValue([`responses`,this.props.index,`mark`]);
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
            this.state.answers.forEach((k,i) => {
                let grade = formInstance.getFieldValue([`responses`,this.props.index,`answers`,i,`grade`]);
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
            const key = this.state.response.answers[index].uid;
            return (
            // k is the unique id of the answer which created in this.add()
            <Draggable
                key={"drag_"+key}
                draggableId={"drag_"+key}
                index={index}
            >
                {(provided, snapshot) => (
                    <div
                        key={key}
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
                                    <Tag key={key} closable onClose={()=>this.remove(index)} color={this.getColor(index)}>
                                        {"Choice " + (index+1)}
                                    </Tag>
                                }
                                required={false}
                                key={key}
                                name={["responses", this.props.index, "answers", index, "text"]}
                                getValueProps={ (value) => {/*console.log('gvp',index, value);*/ return value ? value.code: ""}}
                                rules={[{
                                        required: true,
                                        message: "Cannot have empty body choice.",
                                    }
                                ]}
                            >
                                <XmlEditor initialValue={this.state.response.answers[index] && this.state.response.answers[index].text}/>
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Feedback"
                                name={["responses", this.props.index, "answers", index, "comment"]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Grade"
                                name={["responses", this.props.index, "answers", index, "grade"]}
                                dependencies={[
                                    ["responses", this.props.index, "type", "single"],
                                    ["responses", this.props.index, "mark"],
                                    ...this.state.answers.map((el, i)=> {
                                        if (el !== k) {
                                            return ["responses", this.props.index, "answers", i, "grade"];
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
            <Panel
                // extra props due to https://github.com/react-component/collapse/issues/73
                accordion={this.props.accordion}
                collapsible={this.props.collapsible}
                destroyInactivePanel={this.props.destroyInactivePanel}
                expandIcon={this.props.expandIcon}
                isActive={this.props.isActive}
                onItemClick={this.props.onItemClick}
                openMotion={this.props.openMotion}
                panelKey={this.props.panelKey}
                prefixCls={this.props.prefixCls}

                style={{marginBottom: 12}}
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
                        <XmlEditor initialValue={this.state.response.text}/>
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
                                        for (const element of getFieldValue(`responses`)) {
                                            if (element.identifier === value) {
                                                if (exists) {
                                                    return Promise.reject(new Error('All identifiers must be unique.'));
                                                }
                                                exists = true;
                                            }
                                        }
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
        );
    }
}
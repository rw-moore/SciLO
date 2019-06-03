import React from "react";

import {Form, Input, Icon, Button, Select, Divider, Card, Radio, Checkbox, Col, InputNumber, Row, Tag} from 'antd';
import tags from "../../mocks/Tags";
import theme from "../../config/theme"
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

/**
 * Input field form template
 */
export default class InputField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            answers: []
        }
    }

    randomID = () => {
        return Math.random().toString(36).substr(2, 9)
    };


    /* remove an answer */
    remove = k => {
        // can use data-binding to get
        const answers = this.state.answers.filter(key => key !== k);

        // can use data-binding to set
        this.setState({
            answers
        });

        this.props.changeOrder(answers);
    };

    /* add an answer */
    add = () => {
        // can use data-binding to get
        const answers = this.state.answers;
        const nextKeys = answers.concat(this.randomID());
        // can use data-binding to set
        // important! notify form to detect changes
        this.setState({
            answers: nextKeys
        });

        this.props.changeOrder(nextKeys);
    };

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
        this.props.changeOrder(answers);
    };

    render() {
        const { TextArea } = Input;

        const { getFieldDecorator, getFieldValue } = this.props.form;


        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const formItemLayoutWithoutLabel = {
            wrapperCol: { span: 24 },
        };

        const buttonItemLayout = {
            wrapperCol: {span: 14, offset: 4},
        };
        const formItems = this.state.answers.map((k, index) => (
            <Draggable key={"drag_"+k} draggableId={"drag_"+k} index={index}>
                { (provided, snapshot) => (
                    <div
                        key={k}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        //innerRef={provided.innerRef}
                        ref={provided.innerRef}
                    >
                        <Card
                            size={"small"}
                            bordered={snapshot.isDragging}
                            style={{backgroundColor: snapshot.isDragging?"white":theme["@white"]}}
                        >
                            <Form.Item
                                {...formItemLayout}
                                label={"answers " + index}
                                required={false}
                                key={k}
                            >
                                {getFieldDecorator(`responses[${this.props.id}].answers[${k}].text`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [
                                        {
                                            required: true,
                                            whitespace: true,
                                            message: "Cannot have empty body.",
                                        },
                                    ],
                                })(<Input
                                    placeholder="enter an answer"
                                    style={{width: '60%', marginRight: 8}}
                                />)}
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    onClick={() => this.remove(k)}
                                />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayout}
                                label="Grade"
                            >
                                {getFieldDecorator(`responses[${this.props.id}].answers[${k}].grade`, {
                                    initialValue: index === 0 ? 100 : 0,
                                })(<InputNumber
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                />)}
                            </Form.Item>
                        </Card>
                    </div>
                )
            }
            </Draggable>
        ));


        return (
            <Card
                title={
                    <span>
                        <Tag onClick={this.props.up} style={{marginLeft: 4}}>
                            <Icon type="caret-up" />
                        </Tag>
                        <Tag onClick={this.props.down}>
                            <Icon type="caret-down" />
                        </Tag>
                        {this.props.title}
                    </span>
                }
                type="inner"
                size="small"
                bodyStyle={{backgroundColor: theme["@white"]}}
                extra={
                    <Icon type="delete" onClick={this.props.remove}/>
                }
            >
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Form.Item label="Text" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].text`, {})(
                            <TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="description of this response" />)}
                    </Form.Item>
                    <Divider />
                    <Droppable droppableId={"drop_"+this.props.id}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                //innerRef={provided.innerRef}
                                ref={provided.innerRef}
                            >
                                {formItems}
                                {provided.placeholder}
                            </div>
                        )}

                    </Droppable>
                    <Form.Item {...formItemLayoutWithoutLabel}>
                        <Button type="default" icon="plus" onClick={this.add}>
                            Add a potential answer
                        </Button>
                    </Form.Item>
                    {/* storing meta data*/}
                    <span hidden={true}>
                        {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "input"})(<input/>)}
                    </span>
                </DragDropContext>
            </Card>
        );
    }
}
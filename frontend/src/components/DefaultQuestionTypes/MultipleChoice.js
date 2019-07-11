import React from "react";

import {
    Form,
    Input,
    Icon,
    Button,
    Divider,
    Card,
    InputNumber,
    Switch,
    Tooltip,
    Tag,
    Collapse, Row, Col
} from 'antd';
import theme from "../../config/theme"
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import randomID from "../../utils/RandomID";

/**
 * Multiple Choice form template
 */
export default class MultipleChoice extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            answers: (props.fetched.answers) ? Object.keys(props.fetched.answers) : []
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

    render() {
        const { TextArea } = Input;
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
                                label={"choice " + index}
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
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].text : undefined
                                })(<Input
                                    placeholder="choice content"
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
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].grade : (index === 0 ? 100 : 0)
                                })(<InputNumber
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                />)}
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
                            onClick={this.props.remove}
                        />
                    }
                    forceRender
                >
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Form.Item label="Text" {...formItemLayout}>
                            {getFieldDecorator(`responses[${this.props.id}].text`, { initialValue : this.props.fetched.text})(
                            <TextArea
                                autosize={{ minRows: 2, maxRows: 6 }}
                                placeholder="description of this response"
                            />)}
                        </Form.Item>
                        <Row>
                            <Col span={4}/>
                            <Col span={7}>
                                <Form.Item label="Attempts">
                                    {getFieldDecorator(`responses[${this.props.id}].attempts`,
                                        { initialValue : this.props.fetched.attempts ? this.props.fetched.attempts : 1})(
                                        <InputNumber
                                            min={0}
                                            max={10}
                                        />)}
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item label="Attempt Deduction">
                                    {getFieldDecorator(`responses[${this.props.id}].deduction`,
                                        { initialValue : this.props.fetched.deduction ? this.props.fetched.deduction : 20})(
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
                                    {getFieldDecorator(`responses[${this.props.id}].free_try`,
                                        {
                                            initialValue : this.props.fetched.free_try ? this.props.fetched.free_try : 0,
                                            rules: [
                                                { validator: this.validateFreeAttempts}
                                            ]})(
                                        <InputNumber min={0} max={10} />)}
                                </Form.Item>
                            </Col>
                        </Row>
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
                                title="Multiple correct answers?"
                                arrowPointAtCenter
                            >
                                <Tag>Single</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.single`, {initialValue : this.props.fetched.type ? this.props.fetched.type.single : true})(
                                    <Switch defaultChecked/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="Use a dropdown menu for rendering (useful when having many options)"
                                arrowPointAtCenter
                            >
                                <Tag>Dropdown</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.dropdown`, {initialValue: this.props.fetched.type ? this.props.fetched.type.dropdown : false})(
                                    <Switch/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tag>Mark</Tag>
                            {getFieldDecorator(`responses[${this.props.id}].mark`,
                                {
                                    initialValue : this.props.fetched.mark ? this.props.fetched.mark : 100,
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
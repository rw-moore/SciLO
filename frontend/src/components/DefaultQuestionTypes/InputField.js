import React from "react";
import {
    Form,
    Input,
    Icon,
    Button,
    Divider,
    Card,
    InputNumber,
    Tag,
    Collapse
} from 'antd';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import theme from "../../config/theme"
import randomID from "../../utils/RandomID"

/**
 * Input field form template
 */
export default class InputField extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            answers: (props.fetched.answers) ? Object.keys(props.fetched.answers) : []
        };
    }

    // componentDidMount() {
    //     if (this.props.fetched) {
    //         let responses = this.props.form.getFieldValue(responses);
    //         responses[this.props.id] = this.props.fetched;
    //         this.props.form.setFieldsValue({
    //             responses: responses,
    //         })
    //     }
    // }

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
                { (provided, snapshot) => (
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
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].text : undefined
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
                                    initialValue: this.props.fetched.answers && this.props.fetched.answers[k] ? this.props.fetched.answers[k].grade : (index === 0 ? 100 : 0)
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
                        Add a potential answer
                    </Button>
                    {/* storing meta data*/}
                    <span hidden={true}>
                        {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "input"})(<input/>)}
                    </span>
                </DragDropContext>
            </Panel>
            </Collapse>
        );
    }
}
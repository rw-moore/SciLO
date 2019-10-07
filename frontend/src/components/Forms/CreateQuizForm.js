import {
    Button,
    Form,
    Input,
    DatePicker,
    Divider,
    Tooltip,
    Checkbox,
    Select,
    InputNumber,
    Col,
    Row,
    Drawer, Card, Icon, Popconfirm, Steps, Switch, message
} from "antd";
import React from "react";
import QuickLook from "../QuestionPreviews/QuickLook";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import theme from "../../config/theme";
import QuestionBankModal from "../../pages/QuestionBankTable/QuestionBankModal";
import Spoiler from "../Spoiler";
import CreateQuestionModal from "../../pages/CreateQuestions/CreateQuestionModal";
import PostQuiz from "../../networks/PostQuiz";
import moment from "moment";
import PutQuiz from "../../networks/PutQuiz";
import GetCourseSelectBar from "./GetCourseSelectBar";

const timeFormat = "YYYY-MM-DD HH:mm:ss";
const notifyCondition = ["Deadline","Submission after deadline","Flag of a question","Every submission"];

/**
 * Create/modify a quiz
 */
class CreateQuizForm extends React.Component {

    state = {
        QuickLook: {
            visible: false,
            question: null
        },
        current: 0,
        showQuestionBank: false,
        showQuestionEditor: false,
        questionEdited: {},
        marks: {}
    };

    // step ahead
    next() {
        const current = this.state.current + 1;
        this.setState({ current });
    }

    // step going back
    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }

    // override mark of a question
    setMark = (id, mark) => {
        const marks = this.state.marks;
        marks[id] = mark;
        this.setState({marks: marks})
    };

    handleSubmit = e => {
        e.preventDefault();

        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }

            // Should format date value before submit.
            const rangeTimeValue = fieldsValue['start_end_time'];
            const lateTimeValue = fieldsValue['late_time'];
            const solutionTimeValue = fieldsValue['show_solution_date'];
            const values = {
                ...fieldsValue,
                'start_end_time': [
                    rangeTimeValue[0].format(timeFormat),
                    rangeTimeValue[1].format(timeFormat),
                ],
                'late_time': lateTimeValue ? lateTimeValue.format(timeFormat): undefined,
                'show_solution_date': solutionTimeValue ? solutionTimeValue.format(timeFormat): undefined,
                questions: this.props.order.map(id=>({id: id, mark: this.state.marks[id]?this.state.marks[id]:this.props.questions[id].mark}))
            };
            console.log('Received values of form: ', values);
            console.log('Json', JSON.stringify(values));

            if (this.props.fetched && this.props.fetched.id) {  // modify the quiz
                PutQuiz(this.props.fetched.id, JSON.stringify(values), this.props.token).then(data => {
                    if (!data || data.status !== 200) {
                        message.error("Submit failed, see console for more details.");
                        console.error(data);
                    } else {
                        this.props.goBack();
                    }
                });
            }
            else {  // create new quiz
                PostQuiz(JSON.stringify(values), this.props.token).then(data => {
                    if (!data || data.status !== 200) {
                        message.error("Submit failed, see console for more details.");
                        console.error(data);
                    } else {
                        this.props.goBack();
                    }
                });
            }
        });
    };

    /* validate form data */
    validate = () => {
        let valid = true;
        this.props.form.validateFields((err) => {
            valid = !err;
            return !err;
        });
        return valid;
    };

    /* make sure we have the late submission time later than the end time */
    validateLateTime = (rule, value, callback) => {
        if (value) {
            const timeRange = this.props.form.getFieldValue("start_end_time");
            if (timeRange && timeRange[1]) {
                const end = timeRange[1];
                if (!value.isAfter(end)) {
                    callback("Oops, you have the late submission time earlier than the end time.");
                }
            }
        }
        callback()
    };

    /* make sure we have the solution post time later than the end time & late submit time */
    validateSolutionTime = (rule, value, callback) => {
        if (value) {
            const endTimeRange = this.props.form.getFieldValue("start_end_time");
            const lateTime = this.props.form.getFieldValue("late_time");
            if (lateTime) {
                if (!value.isSameOrAfter(lateTime)) {
                    callback("Oops, you have the solution post time earlier than the late submit time.");
                }
            }
            if (endTimeRange && endTimeRange[1]) {
                const end = endTimeRange[1];
                if (!value.isSameOrAfter(end)) {
                    callback("Oops, you have the solution post time earlier than the end time.");
                }
            }
        }
        callback()
    };

    /* make sure we have free attempt number fewer than total attempts */
    validateFreeAttempts = (rule, value, callback) => {
        if (value) {
            const attempts = this.props.form.getFieldValue("attempt-limit");
            if (attempts && attempts < value) {
                callback("Oops, you have more free tries than the total number of attempts.");
            }
        }
        callback()
    };

    /* open quick look of a question */
    quickLookQuestion = (question) => {
        this.setState({
            QuickLook: {
                visible: true,
                question: question
            }
        })
    };

    /* close quick look drawer */
    onClose = () => {
        this.setState({
            QuickLook: {
                visible: false,
                question: null
            }
        })
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
        const order = reorder(
            this.props.order,
            result.source.index,
            result.destination.index
        );
        // re-order the answers
        this.props.setOrder(order);
    };

    render() {
        const { RangePicker } = DatePicker;
        const { Option, OptGroup } = Select;
        const { Step } = Steps;
        const {current} = this.state;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const { getFieldDecorator } = this.props.form;

        let rangeConfig = {
            rules: [{ type: 'array', required: true, message: 'Please select time!' }],
            preserve: true,
            initialValue: this.props.fetched && this.props.fetched.start_end_time ? this.props.fetched.start_end_time.map(time => moment.utc(time)) : undefined
        };


        const steps = [
            {
                title: 'Info',
                description: 'some essential info such as deadline',
                content: (
                    <div>
                        <Form.Item
                            required
                            label="Title"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('title', {
                                initialValue: this.props.fetched ? this.props.fetched.title : undefined,
                                rules: [{ required: true, message: 'Please enter a title for the quiz!' }],
                                preserve: true
                            })(
                                <Input placeholder="enter a title" />
                            )}
                        </Form.Item>
                        <GetCourseSelectBar form={this.props.form} token={this.props.token} value={this.props.fetched.course}/>
                        <Form.Item
                            required
                            label="Start / End Time"
                            {...formItemLayout}

                        >
                            {getFieldDecorator('start_end_time', rangeConfig)(
                                <RangePicker showTime format={timeFormat} style={{width: "100%"}}/>,
                            )}
                        </Form.Item>
                        <Form.Item
                            label={<Tooltip title={"Students can submit after the deadline"}>Late Submission</Tooltip>}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('late_time',{
                                rules: [
                                    { validator: this.validateLateTime}
                                ],
                                preserve: true,
                                initialValue: this.props.fetched && this.props.fetched.late_time ? moment.utc(this.props.fetched.late_time) : undefined
                            })(
                                <DatePicker showTime format={timeFormat} style={{width: "100%"}} placeholder="Leave empty to NOT allow late submission"/>,
                            )}
                        </Form.Item>
                        <Form.Item
                            label={<Tooltip title={"when to reveal solution."}>Reveal Solution</Tooltip>}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('show_solution_date',{
                                rules: [
                                    { validator: this.validateSolutionTime}
                                ],
                                preserve: true,
                                initialValue: this.props.fetched && this.props.fetched.show_solution_date ? moment.utc(this.props.fetched.show_solution_date) : undefined
                            })(
                                <DatePicker showTime format={timeFormat} style={{width: "100%"}} placeholder="Leave empty to NOT show the solution"/>,
                            )}
                        </Form.Item>
                    </div>
                )
            },
            {
                title: 'Questions',
                description: 'confirm question selection',
                content: (
                    <div>
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            <Droppable
                                droppableId={"Drop_"}
                            >
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {this.props.order.map((id, index) => (
                                            <Draggable
                                                key={"drag_"+id}
                                                draggableId={"drag_"+id}
                                                index={index}
                                            >
                                                { (provided, snapshot) => (
                                                    <div
                                                        key={id}
                                                        {...provided.draggableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        <Card
                                                            size={"small"}
                                                            bordered={snapshot.isDragging}
                                                            style={{backgroundColor: snapshot.isDragging?"white":theme["@white"]}}
                                                            //{...provided.dragHandleProps}
                                                        >
                                                            <Card.Meta
                                                                avatar={
                                                                    <Icon style={{border: "solid 1px"}} type="bars" {...provided.dragHandleProps}/>
                                                                }
                                                                title={
                                                                    <>
                                                                        <Button type={"link"} onClick={()=>{
                                                                            this.quickLookQuestion(this.props.questions[id])
                                                                        }}>
                                                                            {this.props.questions[id].title}
                                                                        </Button>
                                                                        <span style={{float: "right"}}>
                                                                            <InputNumber
                                                                                //placeholder="mark"
                                                                                size="small"
                                                                                value={this.state.marks[id]?this.state.marks[id]:this.props.questions[id].mark}
                                                                                min={0}
                                                                                max={100000}
                                                                                defaultValue={1}
                                                                                style={{width: 64}}
                                                                                onChange={(value)=>{this.setMark(id, value)}}
                                                                            />
                                                                            <Button type="link" icon="edit" onClick={()=>{
                                                                                this.setState({
                                                                                    showQuestionEditor: true,
                                                                                    questionEdited: {id: id, title: this.props.questions[id].title}
                                                                                })
                                                                            }}/>
                                                                            <Divider type="vertical" />
                                                                            <Popconfirm
                                                                                title="Are you sure?"
                                                                                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                                                                                onConfirm={() => {this.props.delete(id)}}
                                                                            >
                                                                                <Icon type="close" style={{ color: 'red' }} />
                                                                            </Popconfirm>
                                                                        </span>
                                                                    </>
                                                                }
                                                                description={<Spoiler>{this.props.questions[id].text}</Spoiler>}
                                                            />
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )
            },
            {
                title: 'Settings',
                description: 'policy and administration',
                content: (
                    <div>
                        <Form.Item
                            label="Policy Override"
                            {...formItemLayout}
                        >
                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        label="Single attempt only"
                                    >
                                        {getFieldDecorator('options.single_try', {
                                            initialValue: this.props.fetched.options && this.props.fetched.options.single_try ? this.props.fetched.options.single_try : false,
                                        })(
                                            <Switch/>
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="No attempt deduction"
                                    >
                                        {getFieldDecorator('options.no_try_deduction', {
                                            initialValue: this.props.fetched.options && this.props.fetched.options.no_try_deduction ? this.props.fetched.options.no_try_deduction : false,
                                        })(
                                            <Switch/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Method"
                                    >
                                        {getFieldDecorator('options.method', {
                                            initialValue: this.props.fetched.options && this.props.fetched.options.method ? this.props.fetched.options.method : "highest",
                                        })(
                                            <Select style={{ width: "50%" }}>
                                                <Option value="highest">highest</Option>
                                                <Option value="last">last attempt</Option>
                                                <Option value="average">average</Option>
                                                <Option value="minimum">minimum</Option>
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        label="Disable feedback"
                                    >
                                        {getFieldDecorator('options.no_feedback', {
                                            initialValue: this.props.fetched.options && this.props.fetched.options.no_feedback ? this.props.fetched.options.no_feedback : false,
                                        })(
                                            <Switch/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Deduction after deadline:"
                                    >
                                        {getFieldDecorator('late-deduction', {
                                            initialValue: 20,
                                        })(
                                            <InputNumber
                                                disabled={!(this.props.form.getFieldValue("late-time"))}
                                                min={0}
                                                max={100}
                                                formatter={value => `${value}%`}
                                                parser={value => value.replace('%', '')}
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item
                            label="Notify me when"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('notify-condition', {
                                initialValue: ["Deadline","Submission after deadline","Flag of a question"]
                            })(
                                <Checkbox.Group options={notifyCondition}/>
                            )}
                        </Form.Item>
                        <Form.Item
                            label="Who can edit"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('editable', {
                            })(
                                <Select mode={"multiple"} style={{ width: "50%" }} >
                                    <OptGroup label="Professor">
                                        <Option value="jack">Jack</Option>
                                        <Option value="lucy">Lucy</Option>
                                    </OptGroup>
                                    <OptGroup label="TA">
                                        <Option value="Yiminghe">yiminghe</Option>
                                    </OptGroup>
                                </Select>
                            )}
                        </Form.Item>
                    </div>
                )
            },
        ];

        return (
            <Form>
                <Steps current={current} status={this.state.status} onChange={(current)=> {
                    const result = this.validate();
                    if (result) {
                        delete this.state.status;
                        this.setState({current: current})
                    }
                    else {
                        this.setState({status: "error"})
                    }
                }}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} description={item.description}/>
                    ))}
                </Steps>
                <Divider dashed/>
                <div className="steps-content">{steps[current].content}</div>
                <Divider dashed/>
                <div className="steps-action">
                    {current > 0 && (
                        <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    )}

                    {current === steps.length - 1 && (
                        <Button type={"danger"} onClick={this.handleSubmit}>
                            Done
                        </Button>
                    )}

                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={() => {
                            const result = this.validate();
                            if (result) {
                                delete this.state.status;
                                this.next();
                            }
                            else {
                                this.setState({status: "error"});
                            }
                        }}>
                            Next
                        </Button>
                    )}
                    {current === 1 && (
                        <Button
                            icon={"more"}
                            onClick={()=>{this.setState({showQuestionBank: true})}}
                            style={{float: "right"}}
                        >
                            Manage Questions
                        </Button>
                    )}

                </div>
                <Drawer
                    width={640}
                    placement="right"
                    closable={true}
                    mask={false}
                    onClose={this.onClose}
                    visible={this.state.QuickLook.visible}
                    destroyOnClose
                >
                    {this.state.QuickLook.question && <QuickLook question={this.state.QuickLook.question}/>}
                </Drawer>
                <QuestionBankModal
                    token={this.props.token}
                    visible={this.state.showQuestionBank}
                    setQuickLook={this.quickLookQuestion}
                    keys={this.props.keys}
                    update={this.props.update}
                    close={()=>{this.setState({showQuestionBank: false})}}
                />
                <CreateQuestionModal
                    token={this.props.token}
                    visible={this.state.showQuestionEditor}
                    id={this.state.questionEdited.id}
                    title={this.state.questionEdited.title}
                    close={()=>{this.setState({showQuestionEditor: false}); this.props.update(this.props.order);}}
                />
            </Form>
        );
    }
}

export default Form.create({ name: 'CreateQuizForm' })(CreateQuizForm);
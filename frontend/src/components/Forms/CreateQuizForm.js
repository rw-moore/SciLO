import { BarsOutlined, EditOutlined, MoreOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Drawer, Form, Input, InputNumber, message, Popconfirm, Row, Select, Steps, Switch, Tooltip } from "antd";
import moment from "moment";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import theme from "../../config/theme";
import PostQuiz from "../../networks/PostQuiz";
import PutQuiz from "../../networks/PutQuiz";
import CreateQuestionModal from "../../pages/CreateQuestions/CreateQuestionModal";
import QuestionBankModal from "../../pages/QuestionBankTable/QuestionBankModal";
import { sanitizeQuestions } from '../../utils/exportQuestion';
import SaveAs from "../../utils/SaveAs";
import QuickLook from "../QuestionPreviews/QuickLook";
import Spoiler from "../Spoiler";
import GetCourseSelectBar from "./GetCourseSelectBar";

const timeFormat = "YYYY-MM-DD HH:mm:ss";
// const notifyCondition = ["Deadline","Submission after deadline","Flag of a question","Every submission"];

/**
 * Create/modify a quiz
 */
function CreateQuizForm(props) {
    const [form] = Form.useForm();
    return <CreateQuizFormF {...props} form={form} />
}
export default CreateQuizForm;
class CreateQuizFormF extends React.Component {

    state = {
        QuickLook: {
            visible: false,
            question: null
        },
        current: 0,
        showQuestionBank: false,
        showQuestionEditor: false,
        questionEdited: {},
        marks: {},
    };

    componentDidMount() {
        console.log('mount form1', this.props.form.getFieldsValue(true));
        if (Object.keys(this.props.fetched).length) {
            this.props.form.setFieldsValue({
                title: this.props.fetched.title,
                course: this.props.fetched.course?`${this.props.fetched.course}`:undefined
            });
        } else {
            this.props.form.setFieldsValue({
                course: this.props.course?`${this.props.course}`:undefined
            });
        }
        console.log('mount form2', this.props.form.getFieldsValue(true));
    }

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

    export = () => {
        this.props.form.validateFields().then(fieldsValue => {

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
                'late_time': lateTimeValue ? lateTimeValue.format(timeFormat) : null,
                'show_solution_date': solutionTimeValue ? solutionTimeValue.format(timeFormat) : null,
            };

            let output = {};
            output.version = "0.1.1";
            output.timestamp = moment.now();
            output.quiz = values;

            sanitizeQuestions(this.props.order.map(id=>this.props.questions[id]), (questions)=> {
                questions.forEach(question=> {
                    let id = question.id;
                    question.mark = this.state.marks[id] ? this.state.marks[id] : this.props.questions[id].mark;
                })
                output.quiz.questions = questions;
                SaveAs(output, `quiz.json`, "text/plain");
            });
        }).catch(err => {
            message.error("Could not export Quiz. See browser console for more details.");
            console.error(err);
        })
    }

    handleSubmit = e => {
        e.preventDefault();

        this.props.form.validateFields().then(fieldsValue => {
            console.log('submit', fieldsValue);
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
                'late_time': lateTimeValue ? lateTimeValue.format(timeFormat): null,
                'show_solution_date': solutionTimeValue ? solutionTimeValue.format(timeFormat): null,
                'last_modify_date': moment().format(timeFormat),
                questions: this.props.order.map(id=>({id: id, mark: this.state.marks[id]?this.state.marks[id]:this.props.questions[id].mark}))
            };
            console.log('Received values of form: ', values);
            // console.log('Json', JSON.stringify(values));

            if (this.props.fetched && this.props.fetched.id) {  // modify the quiz
                PutQuiz(this.props.fetched.id, JSON.stringify(values), this.props.token).then(data => {
                    if (!data || data.status !== 200) {
                        message.error("Submit failed, see browser console for more details.");
                        console.error(data);
                    } else {
                        this.props.goBack();
                    }
                });
            }
            else {  // create new quiz
                PostQuiz(JSON.stringify(values), this.props.token).then(data => {
                    if (!data || data.status !== 200) {
                        message.error("Submit failed, see browser console for more details.");
                        console.error(data);
                    } else {
                        this.props.goBack();
                    }
                });
            }
        }).catch(err => {
            message.error("Could not submit. See browser console for more details.");
            console.error(err);
        });
    };

    /* validate form data */
    validate = (callback) => {
        this.props.form.validateFields().then(values=> {
            console.log('values', values);
            callback(true);
        }).catch(err => {
            console.log('err', err);
            callback(false);
        });
    };

    /* make sure we have the late submission time later than the end time */
    validateLateTime = (rule, value) => {
        if (value) {
            const timeRange = this.props.form.getFieldValue("start_end_time");
            if (timeRange && timeRange[1]) {
                const end = timeRange[1];
                if (!value.isSameOrAfter(end)) {
                    return Promise.reject(new Error("Oops, you have the late submission time earlier than the end time."));
                }
            }
        }
        return Promise.resolve();
    };

    /* make sure we have the solution post time later than the end time & late submit time */
    validateSolutionTime = (rule, value) => {
        if (value) {
            const endTimeRange = this.props.form.getFieldValue("start_end_time");
            const lateTime = this.props.form.getFieldValue("late_time");
            if (lateTime) {
                if (!value.isSameOrAfter(lateTime)) {
                    return Promise.reject(new Error("Oops, you have the solution post time earlier than the late submit time."));
                }
            }
            if (endTimeRange && endTimeRange[1]) {
                const end = endTimeRange[1];
                if (!value.isSameOrAfter(end)) {
                    return Promise.reject(new Error("Oops, you have the solution post time earlier than the end time."));
                }
            }
        }
        return Promise.resolve()
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
        const { Option } = Select;
        const { Step } = Steps;
        const {current} = this.state;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const steps = [
            {
                title: 'Info',
                description: 'some essential info such as deadline',
                step: 1,
                content: (
                    <div>
                        <Form.Item
                            required
                            label="Title"
                            {...formItemLayout}
                            name={"title"}
                            rules={[
                                { required: true, whitespace: true, message: 'Please enter a title for the quiz!' }
                            ]}
                            preserve={true}
                        >
                            <Input placeholder="enter a title" />
                        </Form.Item>
                        <GetCourseSelectBar form={this.props.form} token={this.props.token} value={this.props.course ? this.props.course : this.props.fetched.course}/>
                        <Form.Item
                            required
                            label="Start / End Time"
                            {...formItemLayout}
                            name={"start_end_time"}
                            rules={[{ type: 'array', required: true, message: 'Please select time!' }]}
                            preserve={true}
                        >
                            <RangePicker showTime format={timeFormat} style={{width: "100%"}}/>
                        </Form.Item>
                        <Form.Item
                            label={<Tooltip title={"Students can submit after the deadline"}>Late Submission</Tooltip>}
                            {...formItemLayout}
                            name={"late_time"}
                            preserve={true}
                            rules={[{validator: this.validateLateTime}]}
                        >
                            <DatePicker showTime format={timeFormat} style={{width: "100%"}} placeholder="Leave empty to NOT allow late submission"/>
                        </Form.Item>
                        <Form.Item
                            label={<Tooltip title={"when to reveal solution."}>Reveal Solution</Tooltip>}
                            {...formItemLayout}
                            name={"show_solution_date"}
                            rules={[{validator: this.validateSolutionTime}]}
                            preserve={true}
                        >
                            <DatePicker showTime format={timeFormat} style={{width: "100%"}} placeholder="Leave empty to NOT show the solution"/>
                        </Form.Item>
                    </div>
                )
            },{
                title: 'Questions',
                description: 'confirm question selection',
                step: 2,
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
                                                                    <BarsOutlined style={{border:"solid 1px"}} {...provided.dragHandleProps}/>
                                                                }
                                                                title={
                                                                    <>
                                                                        <Button type={"link"} onClick={()=>{
                                                                            this.quickLookQuestion(this.props.questions[id])
                                                                        }}>
                                                                            {this.props.questions[id].descriptor}
                                                                        </Button>
                                                                        <span style={{float: "right"}}>
                                                                            <InputNumber
                                                                                //placeholder="mark"
                                                                                size="small"
                                                                                disabled={true}
                                                                                value={this.state.marks[id]?this.state.marks[id]:this.props.questions[id].mark}
                                                                                min={0}
                                                                                max={100000}
                                                                                defaultValue={1}
                                                                                style={{width: 64}}
                                                                                onChange={(value)=>{this.setMark(id, value)}}
                                                                            />
                                                                            <Button type="link" icon={<EditOutlined />} onClick={()=>{
                                                                                this.setState({
                                                                                    showQuestionEditor: true,
                                                                                    questionEdited: {id: id, descriptor: this.props.questions[id].descriptor}
                                                                                })
                                                                            }}/>
                                                                            <Divider type="vertical" />
                                                                            <Popconfirm
                                                                                title="Are you sure?"
                                                                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                                                                onConfirm={() => {this.props.delete(id)}}
                                                                            >
                                                                                <DeleteOutlined style={{color:"red"}}/>
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
            },{
                title: 'Settings',
                description: 'policy and administration',
                step: 3,
                content: (
                    <div>
                        <Form.Item
                            label="Policy Override"
                            {...formItemLayout}
                        >
                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        noStyle={true}
                                        shouldUpdate={(prevValues, currentValues) => prevValues.options.max_attempts!==currentValues.options.max_attempts}
                                    >
                                        {({ getFieldValue }) => (
                                            <div>
                                                <Form.Item
                                                    label={<Tooltip title="Max number of quiz attempts">Number of Attempts</Tooltip>}
                                                    name={["options", "max_attempts"]}
                                                    preserve={true}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: "You must input a number."
                                                        }
                                                    ]}
                                                >
                                                    <InputNumber/>
                                                </Form.Item>
                                                <span hidden={getFieldValue(["options", "max_attempts"])!==0} style={{color:"orange"}}>
                                                    User will have unlimited attempts.
                                                </span>
                                            </div>
                                        )}
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<Tooltip title="Student can only submit one try per question per attempt">Only allow 1 try</Tooltip>}
                                        name={["options", "single_try"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                    <Form.Item
                                        label={<Tooltip title="Do not use a deduction per try within an attempt">No try deduction</Tooltip>}
                                        name={["options", "no_try_deduction"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<Tooltip title="Do not show the student the feedback for any questions">Disable feedback</Tooltip>}
                                        name={["options", "no_feedback"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                    <Form.Item
                                        label={<Tooltip title="">Shuffle Answers</Tooltip>}
                                        name={["options", "shuffle"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        label={<Tooltip title="">Method</Tooltip>}
                                        name={["options", "method"]}
                                        preserve={true}
                                    >
                                        <Select style={{ width: "50%" }}>
                                            <Option value="highest">highest grade</Option>
                                            <Option value="latest">most recent grade</Option>
                                            <Option value="average">average grade</Option>
                                            <Option value="lowest">lowest grade</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        noStyle={true}
                                        shouldUpdate={(prevValues, currentValues)=>prevValues.late_time!==currentValues.late_time}
                                    >
                                        {({ getFieldValue }) => (
                                            <Form.Item
                                                label={<Tooltip title="Penalty for submitting late">Deduction after deadline</Tooltip>}
                                                name={["late-deduction"]}
                                                preserve={true}
                                            >
                                                <InputNumber
                                                    disabled={!getFieldValue("late_time")}
                                                    min={0}
                                                    max={100}
                                                    formatter={value => `${value}%`}
                                                    parser={value => value.replace('%', '')}
                                                />
                                            </Form.Item>
                                        )}
                                    </Form.Item>
                                    
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item
                                        label={<Tooltip title="Hide the quiz from the students.">Hidden</Tooltip>}
                                        name={["options", "is_hidden"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                    <Form.Item
                                        label={<Tooltip title="Allow users to take the quiz even if they are not in the course.">Outside course</Tooltip>}
                                        name={["options", "outside_course"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<Tooltip title="Do not show the student the titles of the questions.">Hide Question Titles</Tooltip>}
                                        name={["options", "hide_titles"]}
                                        preserve={true}
                                        valuePropName={"checked"}
                                    >
                                        <Switch/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </div>
                )
            },
        ];

        const defaults = {
            title: this.props.fetched && this.props.fetched.title ? this.props.fetched.title : undefined,
            start_end_time: this.props.fetched && this.props.fetched.start_end_time ? this.props.fetched.start_end_time.map(time => moment.utc(time)) : undefined,
            late_time: this.props.fetched && this.props.fetched.late_time ? moment.utc(this.props.fetched.late_time) : undefined,
            show_solution_date: this.props.fetched && this.props.fetched.show_solution_date ? moment.utc(this.props.fetched.show_solution_date) : undefined,
            options: {
                max_attempts: this.props.fetched.options && (this.props.fetched.options.max_attempts!==undefined) ? this.props.fetched.options.max_attempts: 1,
                single_try: this.props.fetched.options && this.props.fetched.options.single_try ? this.props.fetched.options.single_try : false,
                no_try_deduction: this.props.fetched.options && this.props.fetched.options.no_try_deduction ? this.props.fetched.options.no_try_deduction : false,
                no_feedback: this.props.fetched.options && this.props.fetched.options.no_feedback ? this.props.fetched.options.no_feedback : false,
                shuffle: this.props.fetched.options && this.props.fetched.options.shuffle ? this.props.fetched.options.shuffle : false,
                method: this.props.fetched.options && this.props.fetched.options.method ? this.props.fetched.options.method : "highest",
                is_hidden: this.props.fetched.options && this.props.fetched.options.is_hidden ? this.props.fetched.options.is_hidden : false,
                outside_course: this.props.fetched.options && this.props.fetched.options.outside_course ? this.props.fetched.options.outside_course : false,
                hide_titles: this.props.fetched.options && (this.props.fetched.options.hide_titles!==undefined) ? this.props.fetched.options.hide_titles : true,
            },
            "late-deduction": 20
        }

        return (
            <Form form={this.props.form} initialValues={defaults}>
                <Steps current={current} status={this.state.status} onChange={(current)=> {
                    this.validate((result)=> {
                        if (result) {
                            delete this.state.status;
                            this.setState({current: current})
                        }
                        else {
                            this.setState({status: "error"})
                        }
                    });
                }}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} description={item.description}/>
                    ))}
                </Steps>
                <Divider dashed/>
                {steps.map((item, index) => (
                    <div
                        className={`steps-content ${item.step!==current+1 && "hidden"}`}
                        key={index}
                    >
                        {item.content}
                    </div>
                ))}
                <Divider dashed/>
                <div className="steps-action">
                    {current > 0 && (
                        <Button style={{ marginRight: 8 }} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    )}

                    {current === steps.length - 1 && (
                        <>
                        <Button type={"danger"} onClick={this.handleSubmit}>
                            Done
                        </Button>

                        <Button style={{float: "right"}}onClick={this.export}>
                            Export
                        </Button>
                        </>
                    )}

                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={() => {
                            this.validate((result)=>{
                                if (result) {
                                    delete this.state.status;
                                    this.next();
                                }
                                else {
                                    this.setState({status: "error"});
                                }
                            });
                            
                        }}>
                            Next
                        </Button>
                    )}
                    {current === 1 && (
                        <Button
                            icon={<MoreOutlined/>}
                            onClick={()=>{this.setState({showQuestionBank: true})}}
                            style={{float: "right"}}
                        >
                            Manage Questions
                        </Button>
                    )}

                </div>
                <QuestionBankModal
                    token={this.props.token}
                    visible={this.state.showQuestionBank}
                    setQuickLook={this.quickLookQuestion}
                    keys={this.props.keys}
                    update={this.props.update}
                    close={()=>{this.setState({showQuestionBank: false})}}
                />
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
                <CreateQuestionModal
                    token={this.props.token}
                    visible={this.state.showQuestionEditor}
                    id={this.state.questionEdited.id}
                    title={this.state.questionEdited.descriptor}
                    close={()=>{this.setState({showQuestionEditor: false}); this.props.update(this.props.order);}}
                />
            </Form>
        );
    }
}

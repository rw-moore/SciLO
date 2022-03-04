import { BarsOutlined, EditOutlined, MoreOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Drawer, Form, Input, InputNumber, message, Popconfirm, Radio, Row, Select, Space, Steps, Switch, Tooltip, Typography } from "antd";
import Checkbox from 'antd/lib/checkbox/Checkbox';
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
            const lateTimeValue = fieldsValue['late_time'];
            const values = {
                ...fieldsValue,
                'start_date': fieldsValue['start_date'].format(timeFormat),
                'end_date': fieldsValue['end_date']?.format(timeFormat),
                'late_time': lateTimeValue ? lateTimeValue.format(timeFormat) : null,
            };

            let output = {};
            output.version = "0.1.2";
            output.timestamp = moment.now();
            output.quiz = values;

            sanitizeQuestions(this.props.order.map(id=>this.props.questions[id]), (questions)=> {
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
            const values = {
                ...fieldsValue,
                'start_date': fieldsValue['start_date'].format(timeFormat),
                'end_date': fieldsValue['end_date']?.format(timeFormat),
                'late_time': fieldsValue['late_time']?.format(timeFormat),
                'last_modify_date': moment().format(timeFormat),
                questions: this.props.order.map(id=>({id: id}))
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
    validate = (next, callback) => {
        return callback(true);
        this.props.form.validateFields().then(values=> {
            console.log('values', values);
            callback(true);
        }).catch(err => {
            console.log('err', err);
            callback(false);
        });
    };

    validateEndTime = (rule, value) => {
        if (value) {
            const startTime = this.props.form.getFieldValue('start_date');
            if (startTime) {
                if (!value.isSameOrAfter(startTime)) {
                    return Promise.reject(new Error("Oops, you have the end of the quiz earlier that the start of the quiz."));
                }
            }
        }
        return Promise.resolve();
    }

    /* make sure we have the late submission time later than the end time */
    validateLateTime = (rule, value) => {
        if (value) {
            const endTime = this.props.form.getFieldValue("end_date");
            if (endTime) {
                if (!value.isSameOrAfter(endTime)) {
                    return Promise.reject(new Error("Oops, you have the late submission time earlier than the end time."));
                }
            }
        }
        return Promise.resolve();
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

    reviewOption = (title, name, description, disabled=[]) => {
        disabled = [];
        let show_tip = name==="during";
        let tip = (title)=>(<span style={{marginLeft:4}}><Tooltip title={title} trigger={"click"} placement="right"><QuestionCircleOutlined style={{color:'blue'}}/></Tooltip></span>)
        return (
            <Space direction="vertical" size={[0,1]}>
                <Typography.Title level={4}>
                    {title}
                    {tip(description)}
                </Typography.Title>
                <Form.Item
                    name={["review_options", name, "attempt"]}
                    valuePropName="checked"
                    preserve={true}
                    noStyle={true}
                >
                    <Checkbox disabled={disabled.findIndex((val)=>val==="attempt")>=0}>
                        The Attempt
                        {show_tip && tip("Whether the student can review the attempt at all.")}
                    </Checkbox>
                </Form.Item>
                <Form.Item
                    name={["review_options", name, "correct"]}
                    valuePropName="checked"
                    preserve={true}
                    noStyle={true}
                >
                    <Checkbox disabled={disabled.findIndex((val)=>val==="correct")>=0}>
                        Whether Correct
                        {show_tip && tip("This covers the highlighting that denotes correct, partially correct or incorrect")}
                    </Checkbox>
                </Form.Item>
                <Form.Item
                    name={["review_options", name, "marks"]}
                    valuePropName="checked"
                    preserve={true}
                    noStyle={true}
                >
                    <Checkbox disabled={disabled.findIndex((val)=>val==="marks")>=0}>
                        Marks
                        {show_tip && tip("The numerical marks for each question and the score overall.")}
                    </Checkbox>
                </Form.Item>
                <Form.Item
                    name={["review_options", name, "feedback"]}
                    valuePropName="checked"
                    preserve={true}
                    noStyle={true}
                >
                    <Checkbox disabled={disabled.findIndex((val)=>val==="feedback")>=0}>
                        Feedback
                        {show_tip && tip("The feedback given by the evaluation tree and any multiple choice fields they selected")}
                    </Checkbox>
                </Form.Item>
                <Form.Item
                    name={["review_options", name, "solution"]}
                    valuePropName="checked"
                    preserve={true}
                    // noStyle={true}
                >
                    <Checkbox disabled={disabled.findIndex((val)=>val==="solution")>=0}>
                        Solution
                        {show_tip && tip(
                            <div style={{overflow:"auto"}}>
                                <p>Solution is shown to the student after they have completed the question. Unlike feedback, which depends on the question type and what response the student gave, the same solution text is shown to all students.</p>
                                <p>You can use the solution to give students a fully worked answer and perhaps a link to more information they can use if they did not understand the questions.</p>
                            </div>
                        )}
                    </Checkbox>
                </Form.Item>
            </Space>
        )
    }

    render() {
        const { Option } = Select;
        const { Step } = Steps;
        const {current} = this.state;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };

        const steps = [
            {
                title: 'General',
                description: 'Basic info',
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
                            label="Start Time"
                            {...formItemLayout}
                            name={"start_date"}
                            rules={[{ required: true, message: 'Please select time!' }]}
                            preserve={true}
                        >
                            <DatePicker showTime format={timeFormat} style={{width: "100%"}}/>
                        </Form.Item>
                        <Form.Item
                            label="End Time"
                            {...formItemLayout}
                            name={"end_date"}
                            preserve={true}
                            rules={[{validator: this.validateEndTime}]}
                        >
                            <DatePicker 
                                showTime 
                                format={timeFormat} 
                                style={{width: "100%"}}
                                allowClear={true}
                                placeholder="Leave empty to have no end date for the quiz."
                            />
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
                    </div>
                )
            },{
                title: "Review Options",
                step: 2,
                content: (
                    <div>
                        <Row>
                            <Col span={12}>
                                {this.reviewOption("During the attempt", "during", "Settings are revelant for giving feedback to the student between tries", ["attempt","correct","marks"])}
                            </Col>
                            <Col span={12}>
                                {this.reviewOption("Immediately after the attempt", "after", "Settings apply for 2 minutes after submit all and finish is clicked", ["correct","feedback","solution"])}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                {this.reviewOption("Later while the quiz is still open", "later", "Settings apply after the above until the quiz closes", ["correct","feedback","solution"])}
                            </Col>
                            <Col span={12}>
                                {this.reviewOption(
                                    "After the quiz closes", 
                                    "closed", 
                                    "Settings apply after the quiz has closed",
                                    this.props.form.getFieldValue(["end_date"])!==null?["correct","feedback"]:["correct","marks","feedback"]
                                )}
                            </Col>
                        </Row>
                    </div>
                )
            },{
                title: 'Questions',
                description: 'confirm question selection',
                step: 3,
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
                description: 'Policy and administration',
                step: 4,
                content: (
                    <div>
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
                    </div>
                )
            },
        ];

        const defaults = {
            title: this.props.fetched?.title,
            start_date: this.props.fetched?.start_date && moment.utc(this.props.fetched.start_date),
            end_date: this.props.fetched?.end_date && moment.utc(this.props.fetched.end_date),
            late_time: this.props.fetched?.late_time && moment.utc(this.props.fetched.late_time),
            review_options: {
                during: {
                    attempt:this.props.fetched?.review_options?.during?.attempt??true,
                    correct:this.props.fetched?.review_options?.during?.correct??true,
                    marks: this.props.fetched?.review_options?.during?.marks??true,
                    feedback:this.props.fetched?.review_options?.during?.feedback??false,
                    solution:this.props.fetched?.review_options?.during?.solution??false
                }, after: {
                    attempt:this.props.fetched?.review_options?.after?.attempt??false,
                    correct:this.props.fetched?.review_options?.after?.correct??true,
                    marks: this.props.fetched?.review_options?.after?.marks??true,
                    feedback:this.props.fetched?.review_options?.after?.feedback??false,
                    solution:this.props.fetched?.review_options?.after?.solution??false
                }, later: {
                    attempt:this.props.fetched?.review_options?.later?.attempt??false,
                    correct:this.props.fetched?.review_options?.later?.correct??true,
                    marks: this.props.fetched?.review_options?.later?.marks??true,
                    feedback:this.props.fetched?.review_options?.later?.feedback??false,
                    solution:this.props.fetched?.review_options?.later?.solution??false
                }, closed: {
                    attempt:this.props.fetched?.review_options?.closed?.attempt??false,
                    correct:this.props.fetched?.review_options?.closed?.correct??true,
                    marks: this.props.fetched?.review_options?.closed?.marks??true,
                    feedback:this.props.fetched?.review_options?.closed?.feedback??true,
                    solution:this.props.fetched?.review_options?.closed?.solution??false
                }
            },
            options: {
                max_attempts: this.props.fetched?.options?.max_attempts ?? 1,
                single_try: this.props.fetched?.options?.single_try ?? false,
                no_try_deduction: this.props.fetched?.options?.no_try_deduction ?? false,
                shuffle: this.props.fetched?.options?.shuffle ?? false,
                method: this.props.fetched?.options?.method ?? "highest",
                is_hidden: this.props.fetched?.options?.is_hidden ?? false,
                outside_course: this.props.fetched?.options?.outside_course ?? false,
                hide_titles: this.props.fetched?.options?.hide_titles ?? true,
            },
            "late-deduction": 20
        }

        return (
            <Form form={this.props.form} initialValues={defaults}>
                <Steps current={current} status={this.state.status} onChange={(current)=> {
                    this.validate(current, (result)=> {
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
                    {current === 2 && (
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

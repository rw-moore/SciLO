import React from 'react';
import {Link, withRouter} from "react-router-dom";
import GetCourses from "../../networks/GetCourses";
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Divider, Input, List, message, Modal, Tooltip, Typography } from "antd";
import "./index.css";
import PostCourse from "../../networks/PostCourse";
import EnrollCourse from "../../networks/EnrollInCourseByCode";
import Admin from "../../contexts/Admin";

const CourseCreateModal = Form.create({ name: 'course_create_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Create a new Course"
                    okText="Create"
                    onCancel={onCancel}
                    onOk={onCreate}
                    confirmLoading={this.props.confirmLoading}
                >
                    <Form layout="vertical">
                        <Form.Item label="Short Name">
                            {getFieldDecorator('shortname', 
                                {
                                    rules: [{ required: true, message: 'Please input the title of the course!' }],
                                })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item 
                            label={
                                <span>
                                    Full Name &nbsp;
                                    <Tooltip title={"Leave empty to use the short name as full name."}>
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                </span>
                            }
                        >
                            {getFieldDecorator('fullname')(<Input/>)}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);
const CourseEnrollModal = Form.create({name: 'course_enroll_modal' }) (
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Enroll in a new Course"
                    okText="Enroll"
                    onCancel={onCancel}
                    onOk={onCreate}
                    confirmLoading={this.props.confirmLoading}
                >
                    <Form layout="vertical">
                        <Form.Item label="Enrollment Code">
                            {getFieldDecorator('enroll_code', 
                                {
                                    rules: [{ required: true, message: 'Please input the enrollment code of the course!' }],
                                })(<Input />)
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);

class Course extends React.Component {
    state = {
        data: [],
        create: false,
        enroll: false
    };

    componentDidMount() {
        this.fetchCourses();
    };

    /* fetch courses */
    fetchCourses = () => {
        this.setState({ data: [], fetching: true });
        GetCourses(this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch courses, see browser console for more details.");
                    this.setState({
                        fetching: false,
                    })
                }
                else {
                    this.setState({
                        fetching: false,
                        data: data.data,
                    });
                }
            }
        );
    };

    showCreateModal = () => {
        this.setState({ create: true });
    };

    showEnrollModal = () => {
        this.setState({ enroll: true});
    };

    handleCancel = () => {
        this.setState({ create: false, enroll: false });
    };

    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of form: ', values);
            if (!values.fullname || values.fullname.length === 0) {
                values.fullname = values.shortname;
            }

            PostCourse(values, this.props.token).then(
                data => {
                    if (!data || data.status !== 200) {
                        message.error("Cannot create course, see browser console for more details.");
                        this.setState({
                            fetching: false,
                        })
                    }
                    else {
                        this.setState({
                            fetching: false,
                            create: false
                        });
                        this.fetchCourses();
                        form.resetFields();
                    }
                }
            );
        });
    };

    handleEnroll = () => {
        const {form} = this.formRef2.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            EnrollCourse(values, this.props.token).then(
                data => {
                    if (!data || data.status !== 200) {
                        message.error("Cannot enroll in course, see browser console for more details.");
                        this.setState({
                            fetching: false,
                        })
                    }
                    else {
                        this.setState({
                            fetching: false,
                            enroll: false
                        });
                        this.fetchCourses();
                        form.resetFields();
                    }
                }
            );
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    saveFormRef2 = formRef => {
        this.formRef2 = formRef;
    };

    render() {
        return (
            <div className={"CoursePanel"}>
                <Typography.Title level={2}>Dashboard</Typography.Title>
                <span style={{float: "right", margin: 12}}>
                    <Button type={"primary"} icon={<PlusOutlined />} onClick={this.showEnrollModal}>Enroll in a Course</Button>
                    <Admin>
                        <span style={{margin: 12}}>
                            <Button type={"primary"} icon={<PlusOutlined />} onClick={this.showCreateModal}>Add a Course</Button>
                        </span>
                    </Admin>
                </span>
                <Divider dashed/>
                <List
                    size={"large"}
                    bordered
                    dataSource={this.state.data}
                    renderItem={course => (
                        <List.Item style={{background: "white"}}>
                            <Link to={`Course/${course.id}`}><Button type={"link"} style={{fontSize: 20}}>
                                {`${course.shortname} - ${course.fullname}`}
                            </Button></Link>
                        </List.Item>
                    )}
                />
                <Admin>
                    <CourseCreateModal
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.create}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        confirmLoading={this.state.fetching}
                    />
                </Admin>
                <CourseEnrollModal
                    wrappedComponentRef={this.saveFormRef2}
                    visible={this.state.enroll}
                    onCancel={this.handleCancel}
                    onCreate={this.handleEnroll}
                    confirmLoading={this.state.fetching}
                />
                {/*<Collapse accordion>*/}
                    {/*{this.state.data.map(course =>*/}
                        {/*<Panel header={<Typography.Text strong>{`${course.shortname} - ${course.fullname}`}</Typography.Text>} key={course.id}>*/}
                            {/*<p>{JSON.stringify(course)}</p>*/}
                        {/*</Panel>*/}
                    {/*)}*/}
                {/*</Collapse>*/}
            </div>
        );
    }
}

export default withRouter(Course);
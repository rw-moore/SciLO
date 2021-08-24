import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, List, message, Modal, Tooltip, Typography } from "antd";
import React from 'react';
import { Link, withRouter } from "react-router-dom";
import Admin from "../../contexts/Admin";
import EnrollCourse from "../../networks/EnrollInCourseByCode";
import GetCourses from "../../networks/GetCourses";
import PostCourse from "../../networks/PostCourse";
import "./index.css";

const CourseCreateModal = (props) => {
    const { visible, onCancel, onCreate, confirmLoading, formRef } = props;
    return (
        <Modal
            visible={visible}
            title="Create a new Course"
            okText="Create"
            onCancel={onCancel}
            onOk={onCreate}
            confirmLoading={confirmLoading}
        >
            <Form layout="vertical" ref={formRef}>
                <Form.Item 
                    name="shortname" 
                    label="Short Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the title of the course!'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="fullname"
                    label={
                        <span>
                            Full Name &nbsp;
                            <Tooltip title={"Leave empty to use the short name as full name."}>
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </span>
                    }
                >
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

const CourseEnrollModal = (props) => {
    const { visible, onCancel, onCreate, confirmLoading, formRef } = props;
    return (
        <Modal
            visible={visible}
            title="Enroll in a new Course"
            okText="Enroll"
            onCancel={onCancel}
            onOk={onCreate}
            confirmLoading={confirmLoading}
        >
            <Form layout="vertical" ref={formRef}>
                <Form.Item 
                    name="enroll_code" 
                    label="Enrollment Code"
                    rules={[
                        { 
                            required: true, 
                            message: 'Please input the enrollment code of the course!' 
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}

class Course extends React.Component {
    state = {
        data: [],
        create: false,
        enroll: false
    };
    formRef1 = React.createRef();
    formRef2 = React.createRef();

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
        this.formRef1.current.validateFields().then(values => {
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
                        this.formRef1.current.resetFields();
                    }
                }
            );
        }).catch(err => {
            console.error(err);
        });
    };

    handleEnroll = () => {
        this.formRef2.current.validateFields().then(values => {
            console.log('Received values of form: ', values);
            EnrollCourse(values, this.props.token).then(
                data => {
                    if (!data || data.status !== 200) {
                        message.error(data.data.message || "Cannot enroll in course, see browser console for more details.");
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
                        this.formRef2.current.resetFields();
                    }
                }
            );
        }).catch(err => {
            console.error(err);
        });
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
                        formRef={this.formRef1}
                        visible={this.state.create}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        confirmLoading={this.state.fetching}
                    />
                </Admin>
                <CourseEnrollModal
                    formRef={this.formRef2}
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
import React from 'react';
import {Link, withRouter} from "react-router-dom";
import GetCourses from "../../networks/GetCourses";
import {Button, Collapse, Divider, Form, Icon, Input, List, message, Modal, Tooltip, Typography} from "antd";
import "./index.css";
import PostCourse from "../../networks/PostCourse";

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
                            {getFieldDecorator('shortname', {
                                rules: [{ required: true, message: 'Please input the title of the course!' }],
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label={
                            <span>
                                Full Name &nbsp;
                                <Tooltip title={"Leave empty to use the short name as full name."}>
                                    <Icon type="question-circle" />
                                </Tooltip>
                            </span>
                        }>
                            {getFieldDecorator('fullname')(<Input/>)}
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
        create: false
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
                    message.error("Cannot fetch courses, see console for more details.");
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

    showModal = () => {
        this.setState({ create: true });
    };

    handleCancel = () => {
        this.setState({ create: false });
    };

    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of form: ', values);
            if (!values.fullname || values.fullname.length === 0) {
                values.fullname = values.shortname
            }

            PostCourse(values, this.props.token).then(
                data => {
                    if (!data || data.status !== 200) {
                        message.error("Cannot create course, see console for more details.");
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

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    render() {
        const { Panel } = Collapse;
        return (
            <div className={"CoursePanel"}>
                <Typography.Title level={2}>Dashboard</Typography.Title>
                <span style={{float: "right", margin: 12}}>
                    <Button type={"primary"} icon="plus" onClick={this.showModal}>Add a Course</Button>
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
                <CourseCreateModal
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.create}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
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
        )
    }
}

export default withRouter(Course);
import React from "react";
import { UserAddOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, message, Modal, Select, Typography } from "antd";
import HasPermission from "../../contexts/HasPermission";
import SetCodeEnroll from "../../networks/SetCodeEnroll.js";

const SetEnrollRoleModal = Form.create({ name: 'set_enroll_role_modal' })(
    // eslint-disable-next-line
    class extends React.Component {

        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Set role for enrollment by code"
                    okText="Set"
                    onCancel={onCancel}
                    onOk={onCreate}
                    confirmLoading={this.props.confirmLoading}
                >
                    <Form layout="vertical">
                        <Form.Item label="Role when enrolling using code">
                            {getFieldDecorator('group')(
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Select role"
                                    style={{ width: '100%' }}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {this.props.groups.map(g => (
                                        <Select.Option key={g.id}>{g.name}</Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>

                    </Form>
                </Modal>
            );
        }
    },
);

class CourseEnrollment extends React.Component {
    state = {};

    showModalUser = () => {
        this.setState({ modal: 1 });
    };

    handleCancel = () => {
        this.setState({ modal: 0 });
    };

    handleCreateUser = () => {
        const { form } = this.formRef1.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            SetCodeEnroll(this.props.course.id, values.group, this.props.token).then( data => {
                if (!data || data.status !== 200) {
                    message.error("Could not set default role, see browser console for more details.");
                    this.setState({
                        loading: false
                    })
                }
                else {
                    this.setState({
                        loading: false
                    });
                    this.props.fetch();
                }
            });
        });
    };

    saveFormRef1 = formRef => {
        this.formRef1 = formRef;
    };

    render() {
        if  (this.props.course.groups) {
            var enroll_role = this.props.course.enroll_role ? this.props.course.enroll_role : "None";
            return (
                <div className="CourseEnrollment">
                    <div style={{display: "flex"}}>
                        <Typography.Title level={4}>
                            {`Enrollment Code: ${this.props.course.secret_code} Role: ${enroll_role}`}
                        </Typography.Title>
                        <HasPermission id={this.props.course.id} nodes={["access_code"]}>
                            <span style={{marginLeft: 12}}>
                                <Button type={"primary"} icon={<UserAddOutlined />} onClick={this.showModalUser}>Set Enrollment Role</Button>
                            </span>
                        </HasPermission>
                    </div>
                    <HasPermission id={this.props.course.id} nodes={["access_code"]}>
                        <SetEnrollRoleModal
                            wrappedComponentRef={this.saveFormRef1}
                            visible={this.state.modal===1}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreateUser}
                            groups={this.props.course.groups}
                            token={this.props.token}
                        />
                    </HasPermission>
                </div>
            );
        }
        else {
            return <></>
        }
    }
}

export default CourseEnrollment;
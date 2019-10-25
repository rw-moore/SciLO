import React from "react";
import {Button, Card, Icon, Input, List, message, Modal, Select, Spin, Tooltip} from "antd";
import {Typography} from "antd";
import {Link} from "react-router-dom";
import {Form} from "antd";
import PostCourse from "../../networks/PostCourse";
import CheckUsername from "../../networks/CheckUsername";
import GetUserByUsername from "../../networks/GetUserByUsername";
import {PermTransfer} from "./PermTransfer";

const AddPersonModal = Form.create({ name: 'add_person_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        /* username validate */
        validateUsername = (rule, value, callback) => {
            GetUserByUsername(value, this.props.token).then(data => {
                if (!data || data.status !== 200) {
                    callback("User does not exist or network issue.");
                } else {
                    console.log(data.data);
                    callback()
                }
            });
        };

        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Add a Person"
                    okText="Add"
                    onCancel={onCancel}
                    onOk={onCreate}
                    confirmLoading={this.props.confirmLoading}
                >
                    <Form layout="vertical">
                        <Form.Item label="Username">
                            {getFieldDecorator('username', {
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please enter a username.',
                                    },
                                    {
                                        validator: this.validateUsername
                                    }
                                ],
                                validateFirst: true,
                                validateTrigger: "onBlur"
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="Group">
                            {getFieldDecorator('group')(
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="select course"
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

const AddGroupModal = Form.create({ name: 'add_group_modal' })(
    // eslint-disable-next-line
    class extends React.Component {

        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Add a Group"
                    okText="Add"
                    onCancel={onCancel}
                    onOk={onCreate}
                    confirmLoading={this.props.confirmLoading}
                >
                    <Form layout="vertical">
                        <Form.Item label="Name">
                            {getFieldDecorator('name', {
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please enter a group name.',
                                    },
                                ],
                                validateFirst: true,
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="Permissions">
                            {getFieldDecorator('permissions', {})(<PermTransfer/>)}
                        </Form.Item>

                    </Form>
                </Modal>
            );
        }
    },
);


export default class CoursePeople extends React.Component {
    state = {};

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
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    renderGroup = (group) => {
        return (
            <List
                extra={group.name}
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 3,
                }}
                dataSource={group.users}
                renderItem={user => (
                    <List.Item>
                        <Card title={user}>UserInfo</Card>
                    </List.Item>
                )}
            />
        )
    };


    render() {
        if  (this.props.groups) {
            return (
                <div className="CoursePeople">
                    <Typography.Title level={3}>
                        {`People`}
                        <span style={{float: "right"}}>
                            <Button type={"primary"} icon="plus" onClick={this.showModal}>Add a Person</Button>
                        </span>
                    </Typography.Title>
                    {this.props.groups.map((group) => this.renderGroup(group))}
                    <AddPersonModal
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.create}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        groups={this.props.groups}
                        token={this.props.token}
                    />
                    <AddGroupModal
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.create}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        groups={this.props.groups}
                        token={this.props.token}
                    />
                </div>
            )
        }
        else {
            return <></>
        }
    }
}
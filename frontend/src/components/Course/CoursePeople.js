import { DeleteOutlined, QuestionCircleOutlined, UserAddOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, List, message, Modal, Popconfirm, Select, Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import Admin from "../../contexts/Admin";
import HasPermission from "../../contexts/HasPermission";
import AddUserByUsername from "../../networks/AddUserByUsername";
import GetUserByUsername from "../../networks/GetUserByUsername";
import PostGroup from "../../networks/PostGroup";
import RemoveUserByUsername from "../../networks/RemoveUserByUsername";
import { PermTransfer } from "./PermTransfer";

const AddPersonModal = (props) => {
    /* username validate */
    // const validateUsername = (rule, value, callback) => {
    //     GetUserByUsername(value, this.props.token).then(data => {
    //         if (!data || data.status !== 200) {
    //             callback("User not found or network issue.");
    //         } else {
    //             console.log(data.data);
    //             callback()
    //         }
    //     });
    // };

    const { visible, onCancel, onCreate, confirmLoading, groups, formRef } = props;
    return (
        <Modal
            visible={visible}
            title="Add a Person"
            okText="Add"
            onCancel={onCancel}
            onOk={onCreate}
            confirmLoading={confirmLoading}
        >
            <Form layout="vertical" ref={formRef}>
                <Form.Item 
                    name="username" 
                    label="Username"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter a username.'
                        },
                        () => ({
                            async validator(_, value) {
                                GetUserByUsername(value, props.token).then(data => {
                                    console.log('test', data);
                                    if (!data || data.status !== 200) {
                                        return Promise.reject(new Error("User not found or network issue."));
                                    } else {
                                        console.log(data.data);
                                        return Promise.resolve();
                                    }
                                })
                            }
                        })
                    ]}
                    validateFirst={true}
                    validateTrigger={"onBlur"}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="group" label="Group">
                    <Select
                        showSearch
                        allowClear
                        placeholder="select course"
                        style={{ width: '100%' }}
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {groups.map(g => (
                            <Select.Option key={g.id}>{g.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}

const AddGroupModal = (props) => {
    const { visible, onCancel, onCreate, confirmLoading, formRef } = props;
    return (
        <Modal
            visible={visible}
            title="Add a Group"
            okText="Add"
            onCancel={onCancel}
            onOk={onCreate}
            confirmLoading={confirmLoading}
        >
            <Form layout="vertical" ref={formRef}>
                <Form.Item 
                    name="name" 
                    label="Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter a group name.'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="permissions" label="Permissions">
                    <PermTransfer/>
                </Form.Item>

            </Form>
        </Modal>
    );
}


export default class CoursePeople extends React.Component {
    state = {};
    formRef1 = React.createRef();
    formRef2 = React.createRef();

    showModalUser = () => {
        this.setState({ modal: 1 });
    };

    showModalGroup = () => {
        this.setState({ modal: 2 });
    };


    handleCancel = () => {
        this.setState({ modal: 0 });
    };

    handleCreateUser = () => {
        this.formRef1.current.validateFields().then(values => {
            console.log('Received values of form: ', values);
            AddUserByUsername(this.props.course, values.group, values.username, this.props.token).then(data => {
                console.log('results', data);
                if (!data || data.status !== 200) {
                    message.error("Cannot add people, see browser console for more details.");
                    this.setState({
                        loading: false
                    })
                }
                else {
                    this.setState({
                        loading: false,
                    });
                    this.props.fetch();
                }
            });
        }).catch(err => {
            console.error(err);
        });
    };

    handleCreateGroup = () => {
        this.formRef2.current.validateFields().then(values => {
            console.log('Received values of form: ', values);
            PostGroup(values, this.props.course, this.props.token).then( data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot create group, see browser console for more details.");
                    this.setState({
                        loading: false
                    })
                }
                else {
                    this.setState({
                        loading: false,
                    });
                    this.props.fetch();
                }
            });
        }).catch(err => {
            console.error(err);
        });
    };

    remove = (username, group) => {
        console.log("Received values of form: ", {username, group})
        RemoveUserByUsername(this.props.course, group, username, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot remove people, see browser console for more details.");
                this.setState({
                    loading: false
                })
            }
            else {
                this.setState({
                    loading: false,
                });
                this.props.fetch();
            }
        });
    }

    renderGroup = (group, index) => {
        const userCard = user => (
            <List.Item>
                <Card size={"small"}>
                    <span>
                        {/*<UserIcon src={user.avatar ? API.domain+ user.avatar : undefined} user={this.props.loading?<Icon type="loading" />:GetInitial(user)}/>*/}
                        <Typography.Text strong style={{position: "relative", top: "4px"}}>{user.first_name} {user.last_name}</Typography.Text>
                        <HasPermission id={this.props.course} nodes={['add_people']}>
                            <Popconfirm
                                title="Remove User?"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={() => {this.remove(user.username, group.id.toString())}}
                            >
                                <DeleteOutlined style={{ color: 'red', float:"right", paddingTop:"4px" }} />
                            </Popconfirm>
                        </HasPermission>
                        <Link to={"/User/"+user.username} style={{float: "right"}}><Button type={"link"}>({user.username})</Button></Link>
                    </span>
                </Card>
            </List.Item>
        )
        if (group.users.length > 12) {
            return (
                <React.Fragment key={index}>
                    <Divider orientation="left"><Typography.Text>{group.name}</Typography.Text></Divider>
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 4,
                            lg: 4,
                            xl: 6,
                            xxl: 3,
                        }}
                        pagination={{
                            pageSize: 12,
                        }}
                        dataSource={group.users}
                        renderItem={user => userCard(user)}
                    />
                </React.Fragment>
            )
        }
        else if (group.users.length > 0) {
            return (
                <React.Fragment key={index}>
                    <Divider orientation="left"><Typography.Text>{group.name}</Typography.Text></Divider>
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 3,
                            lg: 4,
                            xl: 4,
                            xxl: 4,
                        }}
                        dataSource={group.users}
                        renderItem={user => userCard(user)}
                    />
                </React.Fragment>
            )
        }
    };


    render() {
        if  (this.props.groups) {
            return (
                <div className="CoursePeople">
                    <Typography.Title level={3}>
                        {`People`}
                        <HasPermission id={this.props.course} nodes={["add_people"]}>
                            <span style={{float: "right"}}>
                                <Button.Group>
                                    <Admin>
                                        <Button type={"dashed"} icon={<UsergroupAddOutlined />} onClick={this.showModalGroup}>Create a Group</Button>
                                    </Admin>
                                    <Button type={"primary"} icon={<UserAddOutlined />} onClick={this.showModalUser}>Add a Person</Button>
                                </Button.Group>
                            </span>
                        </HasPermission>
                    </Typography.Title>
                    {this.props.groups.map((group, index) => this.renderGroup(group, index))}
                    <HasPermission id={this.props.course} nodes={["add_people"]}>
                        <AddPersonModal
                            formRef={this.formRef1}
                            visible={this.state.modal===1}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreateUser}
                            groups={this.props.groups}
                            token={this.props.token}
                        />
                        <AddGroupModal
                            formRef={this.formRef2}
                            visible={this.state.modal===2}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreateGroup}
                            groups={this.props.groups}
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
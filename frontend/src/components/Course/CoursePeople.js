import React from "react";
import {
    DeleteOutlined,
    QuestionCircleOutlined,
    UserAddOutlined,
    UsergroupAddOutlined,
} from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
    Button,
    Card,
    Divider,
    Input,
    List,
    message,
    Modal,
    Popconfirm,
    Select,
    Typography,
} from "antd";
import {Link} from "react-router-dom";
import GetUserByUsername from "../../networks/GetUserByUsername";
import {PermTransfer} from "./PermTransfer";
import AddUserByUsername from "../../networks/AddUserByUsername";
import RemoveUserByUsername from "../../networks/RemoveUserByUsername";
import PostGroup from "../../networks/PostGroup";
import HasPermission from "../../contexts/HasPermission";
import Admin from "../../contexts/Admin";

const AddPersonModal = Form.create({ name: 'add_person_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        /* username validate */
        validateUsername = (rule, value, callback) => {
            GetUserByUsername(value, this.props.token).then(data => {
                if (!data || data.status !== 200) {
                    callback("User not found or network issue.");
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
                            {getFieldDecorator('username', 
                                {
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
                                })(<Input />)
                            }
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
                            {getFieldDecorator('name', 
                                {
                                    rules: [
                                        {
                                            required: true,
                                            message: 'Please enter a group name.',
                                        },
                                    ],
                                    validateFirst: true,
                                })(<Input />)
                            }
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
        const { form } = this.formRef1.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            AddUserByUsername(this.props.course,values.group,values.username,this.props.token).then( data => {
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
        });
    };

    handleCreateGroup = () => {
        const { form } = this.formRef2.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
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
        });
    };

    saveFormRef1 = formRef => {
        this.formRef1 = formRef;
    };

    saveFormRef2 = formRef => {
        this.formRef2 = formRef;
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
                        {/*<UserIcon src={user.avatar ? API.domain+":"+API.port+ user.avatar : undefined} user={this.props.loading?<Icon type="loading" />:GetInitial(user)}/>*/}
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
                            wrappedComponentRef={this.saveFormRef1}
                            visible={this.state.modal===1}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreateUser}
                            groups={this.props.groups}
                            token={this.props.token}
                        />
                        <AddGroupModal
                            wrappedComponentRef={this.saveFormRef2}
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
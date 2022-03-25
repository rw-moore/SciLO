import React from "react";
import { BookOutlined, DatabaseOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu } from "antd";
import "./index.css"
import {Link} from "react-router-dom";
import {UserConsumer} from "../../contexts/UserContext";

/**
 * SideNav is the responsive collapsible side navigation bar on the left
 */
export default class SideNav extends React.Component {
    render() {
        const { Sider } = Layout;
        return (
            <Sider
                className="SideNav"
                breakpoint="lg"
                collapsedWidth="0"
                collapsible
                zeroWidthTriggerStyle={{bottom:0, top:"auto"}}
                onBreakpoint={broken => {
                    //console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    //console.log(collapsed, type);
                }}
            >
                <UserConsumer>
                    {
                        (User) => {
                            if (User && (User.user.is_staff || User.user.can_view_questionbank)) {
                                return (
                                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
                                        <Menu.Item key="1">
                                            <Link to={"/Course"}>
                                                <BookOutlined />
                                                <span className="nav-text">Course</span>
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="2">
                                            <Link to={"/Quiz"}>
                                                <FileTextOutlined />
                                                <span className="nav-text">Quiz</span>
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="3">
                                            <Link to={"/QuestionBank"}>
                                                <DatabaseOutlined />
                                                <span className="nav-text">Question Bank</span>
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="4">
                                            <Link to={"/User"}>
                                                <UserOutlined />
                                                <span className="nav-text">User</span>
                                            </Link>
                                        </Menu.Item>
                                    </Menu>
                                );
                            }
                            else if (User) {
                                return (
                                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
                                        <Menu.Item key="1">
                                            <Link to={"/Course"}>
                                                <BookOutlined />
                                                <span className="nav-text">Course</span>
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="2">
                                            <Link to={"/Quiz"}>
                                                <FileTextOutlined />
                                                <span className="nav-text">Quiz</span>
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="4">
                                            <Link to={"/User"}>
                                                <UserOutlined />
                                                <span className="nav-text">User</span>
                                            </Link>
                                        </Menu.Item>
                                    </Menu>
                                );
                            }
                        }
                    }
                </UserConsumer>
            </Sider>
        );
    }
}
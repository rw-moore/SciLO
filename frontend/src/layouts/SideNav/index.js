import React from "react";
import {Icon, Menu, Layout} from "antd";
import "./index.css"
import {Link} from "react-router-dom";

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
                //collapsedWidth="0"
                collapsible
                onBreakpoint={broken => {
                    //console.log(broken);
                }}
                onCollapse={(collapsed, type) => {
                    //console.log(collapsed, type);
                }}
            >
                <div className="logo" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
                    <Menu.Item key="1">
                        <Link to={"/Quiz"}>
                            <Icon type="file-text" />
                            <span className="nav-text">Quiz</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to={"/QuestionBank"}>
                            <Icon type="database" />
                            <span className="nav-text">Question Bank</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Icon type="upload" />
                        <span className="nav-text">nav 3</span>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Icon type="user" />
                        <span className="nav-text">User</span>
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}
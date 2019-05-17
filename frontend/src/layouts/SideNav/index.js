import React from "react";
import {Icon, Menu, Layout} from "antd";
import style from "./Index.less"

/**
 * SideNav is the responsive collapsible side navigation bar on the left
 */
export default class SideNav extends React.Component {
    render() {
        const { Sider } = Layout;
        return (
            <Sider
                class={style.SideNav}
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
                        <Icon type="user" />
                        <span className="nav-text">Quiz</span>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Icon type="database" />
                        <span className="nav-text">Question Bank</span>
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
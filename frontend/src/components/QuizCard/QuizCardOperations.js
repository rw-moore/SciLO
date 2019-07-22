import React from "react";
import {Menu, Dropdown, Icon, Button} from 'antd';

export default class QuizCardOperations extends React.Component {
    render() {
        const menu = (
            <Menu>
                <Menu.Item>
                    <Button onClick={this.props.operation} size="small" icon={this.props.hide ? "eye-invisible" : "eye"} type="link">{this.props.hide ? "Hide" : "Reveal"}</Button>
                </Menu.Item>
                <Menu.Item>
                    <Button size="small" icon="delete" type="link" style={{color: "red"}}>Delete</Button>
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown overlay={menu}>
                {this.props.children}
            </Dropdown>
        )
    }
}
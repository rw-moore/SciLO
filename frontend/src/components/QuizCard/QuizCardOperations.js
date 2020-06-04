import React from "react";
import {Button, Dropdown, Menu} from 'antd';

/**
 * options sub-component for quiz card
 */
export default class QuizCardOperations extends React.Component {
    render() {
        const menu = (
            <Menu>
                <Menu.Item>
                    <Button onClick={this.props.operation} size="small" icon={this.props.hide ? "eye-invisible" : "eye"} type="link">{this.props.hide ? "Hide" : "Reveal"}</Button>
                </Menu.Item>
                <Menu.Item>
                    <Button size="small" icon="delete" type="link" style={{color: "red"}} onClick={this.props.delete}>Delete</Button>
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
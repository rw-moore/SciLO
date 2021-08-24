import React from "react";
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import HasPermission from "../../contexts/HasPermission";
import {Link} from "react-router-dom";

/**
 * options sub-component for quiz card
 */
export default class QuizCardOperations extends React.Component {
    render() {
        const menu = (
            <Menu>
                <Menu.Item key="hide">
                    <HasPermission id={this.props.course} nodes={["change_quiz"]}>
                        <Button
                            onClick={this.props.hide}
                            size="small"
                            icon={!this.props.hidden ? <EyeInvisibleOutlined/> : <EyeOutlined/>}
                            type="link">{!this.props.hidden ? "Hide" : "Reveal"}
                        </Button>
                    </HasPermission>
                </Menu.Item>
                <Menu.Item key="edit">
                    <HasPermission id={this.props.course} nodes={["change_quiz"]}>
                        <Link to={`/Quiz/edit/${this.props.id}`}><Button size="small" icon={<EditOutlined />} type="link">Edit</Button></Link>
                    </HasPermission>
                </Menu.Item>
                <Menu.Item key="link">
                    <HasPermission id={this.props.course} nodes={["change_quiz"]}>
                        <Button size="small" icon={<LinkOutlined />} type="link" onClick={this.props.link}>Link for embedding</Button>
                    </HasPermission>
                </Menu.Item>
                <Menu.Item key="delete">
                    <HasPermission id={this.props.course} nodes={["delete_quiz"]}>
                        <Button size="small" icon={<DeleteOutlined />} type="link" style={{color: "red"}} onClick={this.props.delete}>Delete</Button>
                    </HasPermission>
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
import React from "react";
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
                <Menu.Item>
                    <HasPermission id={this.props.course} nodes={["change_quiz"]}>
                        <Button
                            onClick={this.props.hide}
                            size="small"
                            icon={<LegacyIcon type={!this.props.hidden ? "eye-invisible" : "eye"} />}
                            type="link">{!this.props.hidden ? "Hide" : "Reveal"}
                        </Button>
                    </HasPermission>
                </Menu.Item>
                <Menu.Item>
                    <HasPermission id={this.props.course} nodes={["change_quiz"]}>
                        <Link to={`/Quiz/edit/${this.props.id}`}><Button size="small" icon={<EditOutlined />} type="link">Edit</Button></Link>
                    </HasPermission>
                </Menu.Item>
                <Menu.Item>
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
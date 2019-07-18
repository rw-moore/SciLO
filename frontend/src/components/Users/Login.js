import React from 'react';

import {Dropdown, Icon, Button} from 'antd';
import LoginForm from "../Forms/LoginForm";

export default class Login extends React.Component {
    render() {
        return (
            <Dropdown overlay={<LoginForm/>} trigger={['click']}>
                <Button type="dashed" icon="user" style={this.props.style}>Sign In</Button>
            </Dropdown>
        );
    }
}
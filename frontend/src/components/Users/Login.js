import React from 'react';

import {Dropdown, Button} from 'antd';
import LoginForm from "../Forms/LoginForm";

/**
 * the user login button on the top right header
 */
export default class Login extends React.Component {
    state = {
        showOverlay: false
    };

    setUser = (user) => {
        this.props.setUser(user);
    };

    changeVisibility = (visible) => {this.setState({showOverlay: visible});};

    render() {

        return (
            <Dropdown overlay={<LoginForm setUser={this.setUser}/>} trigger={['click']} visible={this.state.showOverlay} onVisibleChange={this.changeVisibility}>
                <Button type="dashed" icon="user" style={this.props.style}>Sign In</Button>
            </Dropdown>
        );
    }
}
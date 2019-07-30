import React from 'react';

import {Dropdown, Icon, Button, Menu} from 'antd';
import LoginForm from "../Forms/LoginForm";
import UserIcon from "./UserIcon";
import API from "../../networks/Endpoints";
import GetInitial from "../../utils/GetInitial";

export default class UserHeaderControl extends React.Component {
    state = {
        showOverlay: false
    };

    changeVisibility = (visible) => {this.setState({showOverlay: visible});};

    render() {
        const Overlay = (
            <Menu>
                <Menu.Item>
                    <Button style={{color: "red"}} size="small" icon={"logout"} type={"link"} onClick={this.props.signOut}>Sign Out</Button>
                </Menu.Item>
            </Menu>
        );



        return (
            <Dropdown overlay={Overlay} trigger={['click']} visible={this.state.showOverlay} onVisibleChange={this.changeVisibility}>
                <span style={this.props.style} onClick={()=> {this.changeVisibility(!this.state.showOverlay)}}>
                    <UserIcon user={GetInitial(this.props.user)} src={this.props.user.avatar ? API.domain+":"+API.port+ this.props.user.avatar : undefined}/>
                </span>
            </Dropdown>
        );
    }
}
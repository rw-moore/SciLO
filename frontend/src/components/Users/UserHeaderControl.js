import React from 'react';

import {Dropdown, Button, Menu, Tag} from 'antd';
import UserIcon from "./UserIcon";
import API from "../../networks/Endpoints";
import GetInitial from "../../utils/GetInitial";
import {Link} from "react-router-dom";

/**
 * user control (after login) on the top right header
 */
export default class UserHeaderControl extends React.Component {
    state = {
        showOverlay: false
    };

    changeVisibility = (visible) => {this.setState({showOverlay: visible});};

    render() {
        const Overlay = (
            <Menu>
                <Menu.Item>
                    <Link to={"/User"}><Button size="small" icon={"user"} type={"link"} >My Profile</Button></Link>
                </Menu.Item>
                <Menu.Item>
                    <Button style={{color: "red"}} size="small" icon={"logout"} type={"link"} onClick={this.props.signOut}>Sign Out</Button>
                </Menu.Item>
            </Menu>
        );



        return (
            <div>
            <Tag style={{position: "relative", top:"-24px"}}>{this.props.user.is_staff?"Instructor":"Student"}</Tag>
            <Dropdown overlay={Overlay} trigger={['click']} visible={this.state.showOverlay} onVisibleChange={this.changeVisibility}>
                <span style={this.props.style} onClick={()=> {this.changeVisibility(!this.state.showOverlay)}}>
                    <UserIcon user={GetInitial(this.props.user)} src={this.props.user.avatar ? API.domain+":"+API.port+ this.props.user.avatar : undefined}/>
                </span>
            </Dropdown>
            </div>
        );
    }
}
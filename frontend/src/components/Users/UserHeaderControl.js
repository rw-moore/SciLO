import React from 'react';

import {Button, Dropdown, Menu, Popover, Tag} from 'antd';
import UserIcon from "./UserIcon";
import API from "../../networks/Endpoints";
import GetInitial from "../../utils/GetInitial";
import {Link} from "react-router-dom";
import PrintObject from "../PrintObject";

/**
 * user control (after login) on the top right header
 */
export default class UserHeaderControl extends React.Component {
    state = {
        showOverlay: false
    };

    changeVisibility = (visible) => {this.setState({showOverlay: visible});};

    rendericon = () => {
        if (this.props.user.avatarurl) {
            return <UserIcon user={GetInitial(this.props.user)} src={this.props.user.avatarurl}/>
        } else {
            return <UserIcon user={GetInitial(this.props.user)} src={this.props.user.avatar ? API.domain+":"+API.port+ this.props.user.avatar : undefined}/>
        }
    }

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
            <Popover content={<PrintObject>{this.props.user}</PrintObject>}><Tag style={{position: "relative", top:"-24px"}}>{getRole(this.props.user)}</Tag></Popover>
            <Dropdown overlay={Overlay} trigger={['click']} visible={this.state.showOverlay} onVisibleChange={this.changeVisibility}>
                <span style={this.props.style} onClick={()=> {this.changeVisibility(!this.state.showOverlay)}}>
                    {this.rendericon()}
                </span>
            </Dropdown>
            </div>
        );
    }
}

function getRole(user) {
    if (user.is_staff) {
        return "Admin"
    }
    // TODO: change role base on the last course clicked into
    else {
        return "User"
    }

}
import React from 'react';
import {List} from "antd";
import UserIcon from "./NotificationMessage";

export default class MessageCard extends React.Component {
    render() {
        return (
            <div style={{float: "right"}}>
                <List.Item.Meta
                    avatar={
                        <UserIcon user={this.props.item.name.first.substring(0,1)+this.props.item.name.last.substring(0,1)}/>
                    }
                    title={<a href="https://ant.design">{this.props.item.name.first+" "+this.props.item.name.last}</a>}
                    description={<span className="MessageBox"></span>}
                />
            </div>
        );
    }
}
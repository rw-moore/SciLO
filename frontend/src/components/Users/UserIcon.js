import React from 'react';
import {Avatar, Badge, Button} from 'antd';

const UserList = ['U', 'Lucy', 'Tom', 'Edward'];
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

export default class UserIcon extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: UserList[0],
            color: colorList[0],
        };
    }

    changeUser = () => {
        const index = UserList.indexOf(this.state.user);
        this.setState({
            user: index < UserList.length - 1 ? UserList[index + 1] : UserList[0],
            color: index < colorList.length - 1 ? colorList[index + 1] : colorList[0],
        });
    };

    render() {
        return (
            <div style={this.props.style}>
                <Badge count={"1"}>
                    <Avatar
                        shape={"square"}
                        onClick={this.changeUser}
                        style={{ backgroundColor: this.state.color}}>
                        {this.state.user}
                    </Avatar>
                </Badge>
            </div>
        );
    }
}
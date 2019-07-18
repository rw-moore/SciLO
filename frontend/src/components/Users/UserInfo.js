import React from 'react';
import UserIcon from "./UserIcon";
import theme from "../../config/theme"
import {Col, Divider, Row, Tag} from "antd";

export default class UserInfo extends React.Component {
    getInitial = () => {
        let F, L;
        if (this.props.user.first_name) {
            F = this.props.user.first_name[0].toUpperCase()
        }
        if (this.props.user.last_name) {
            L = this.props.user.last_name[0].toUpperCase()
        }
        return F+L;
    };

    render() {
        return (
            <div className="UserInfo">
                <div className="UserAvatar">
                    <div>
                        <UserIcon src={this.props.avatar} user={this.getInitial()} size={128}/>
                    </div>
                    <div style={{fontSize: "3vh", marginTop: "24px", color: theme["@primary-color"] }}>{this.props.user.first_name+" "+this.props.user.last_name}</div>
                    <span style={{fontSize: "2vh", marginTop: "12px", color: theme["@black"]}}>{this.props.user.username}</span>
                </div>
                <Divider dashed />
                <div className="UserBasicInfo">
                    <Row>
                        <Col xl={8} lg={24}>
                            <strong>Institute</strong>
                        </Col>
                        <Col xl={16} lg={24}>
                            {this.props.user.institute}
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={8} lg={24}>
                            <strong>Email</strong>
                        </Col>
                        <Col xl={16} lg={24}>
                            <a href={"mailto:"+this.props.user.email} target="_top">{this.props.user.email}</a>
                        </Col>
                    </Row>
                </div>
                <div className="UserSignature">
                    <h1>Signature Line</h1>
                    <p>On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment</p>
                </div>
                <div className="UserCourses">
                    <h1>Courses</h1>
                    <div>
                        <Tag>MATH 101</Tag>
                        <Tag>MATH 102</Tag>
                    </div>
                </div>
            </div>
        )
    }
}
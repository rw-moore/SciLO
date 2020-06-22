import React from 'react';
import UserIcon from "./UserIcon";
import theme from "../../config/theme"
import {Col, Divider, Icon, Row, Tag} from "antd";
import GetInitial from "../../utils/GetInitial";

/**
 * User basic info in user homepage
 */
export default class UserInfo extends React.Component {
    rendericon = () => {
        if (this.props.user.avatarurl) {
            return <UserIcon user={this.props.loading?<Icon type="loading" />:GetInitial(this.props.user)} size={128} src={this.props.user.avatarurl}/>
        } else {
            return <UserIcon src={this.props.avatar} user={this.props.loading?<Icon type="loading" />:GetInitial(this.props.user)} size={128}/>

        }
    }
    rendercourses = () => {
        if (this.props.user.roles && Object.keys(this.props.user.roles).length) {
            return (<div>
                        {Object.entries(this.props.user.roles).map(role => (<Tag key={role[0]}>{role[1].course}</Tag>))}
                    </div>)
        } else {
            return (<div></div>)
        }
    }

    render() {
        return (
            <div className="UserInfo">
                <div className="UserAvatar">
                    <div>
                        {this.rendericon()}
                    </div>
                    { !this.props.loading && <>
                        <div style={{fontSize: "3vh", marginTop: "24px", color: theme["@primary-color"] }}>{this.props.user.first_name+" "+this.props.user.last_name}</div>
                        <span style={{fontSize: "2vh", marginTop: "12px", color: theme["@black"]}}>{this.props.user.username}</span></>
                    }
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
                    {this.rendercourses()}
                </div>
            </div>
        )
    }
}
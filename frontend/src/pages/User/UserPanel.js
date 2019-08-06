import React from "react"
import {Col, Icon, message, Row, Tabs} from "antd";
import './UserPanel.css';
import GetQuestionById from "../../networks/GetQuestionById";
import GetUserById from "../../networks/GetUserById";
import API from "../../networks/Endpoints";
import UserInfo from "../../components/Users/UserInfo";
import UserAvatarUploadModal from "../../components/Users/UserAvatarUpload";
import UserNotificationCenter from "../../components/Users/UserNotificationCenter";
import UserProfileForm from "../../components/Forms/RegisterForm";
import UserInfoUpdateForm from "../../components/Forms/UserInfoUpdateForm";
import GetUserByUsername from "../../networks/GetUserByUsername";

export default class UserPanel extends React.Component {
    state = {
        user: {},
        loading: true
    };

    componentDidMount() {
        this.fetch();
    }

    // reload the page when the target user changes.
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.name !== this.props.name){
            this.fetch();
        }
    }

    fetch = () => {
        GetUserByUsername(this.props.name, this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch user profile ${this.props.name}, see console for more details.`);
                this.setState({
                    loading: false
                })
            }
            else {
                let user = data.data.user;
                this.setState({user: user, loading: false});
            }
        });
    };

    update = () => {
        GetUserByUsername(this.props.name, this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch user profile ${this.props.name}, see console for more details.`);
                this.setState({
                    loading: false
                })
            }
            else {
                let user = data.data.user;
                this.setState({user: user, loading: false});
                this.props.updateUserInfo(user);
            }
        });
    };

    render() {
        const TabPane = Tabs.TabPane;
        return (
            <div className="UserPanel">
                <Row gutter={24} >
                    <Col lg={7} md={24}>
                        <UserInfo loading={this.state.loading} user={this.state.user} avatar={this.state.user.avatar ? API.domain+":"+API.port+ this.state.user.avatar : undefined}/>
                    </Col>
                    <Col lg={17} md={24}>
                        <Tabs type="line" className="PanelWorkspace" tabBarStyle={{marginBottom: 0}} size={"large"} tabBarGutter={32}>
                            <TabPane tab={<span><Icon type="notification" />Notification</span>} key="1">
                                <UserNotificationCenter/>
                            </TabPane>
                            <TabPane tab={<span><Icon type="user"/>My Profile</span>} key="2">
                                <div style={{marginTop: 32}}><UserInfoUpdateForm user={this.state.user} token={this.props.token} refresh={this.update} /></div>
                            </TabPane>
                            <TabPane tab="Tab Title 3" key="3">
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </div>

        );
    }
}
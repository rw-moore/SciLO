import React from "react"
import {Col, Icon, message, Row, Tabs} from "antd";
import './UserPanel.css';
import GetQuestionById from "../../networks/GetQuestionById";
import GetUserById from "../../networks/GetUserById";
import API from "../../networks/Endpoints";
import UserInfo from "../../components/Users/UserInfo";
import UserAvatarUploadModal from "../../components/Users/UserAvatarUploadModal";
import UserNotificationCenter from "../../components/Users/UserNotificationCenter";

export default class UserPanel extends React.Component {
    state = {
        user: {}
    };

    componentDidMount() {
        this.fetch();
    }

    fetch = () => {
        GetUserById("2").then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch user profile ${this.props.id}, see console for more details.`);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            }
            else {
                let user = data.data.user;
                this.setState({user: user})
            }
        });
    };

    render() {
        const TabPane = Tabs.TabPane;
        return (
            <div className="UserPanel">
                <Row gutter={24} >
                    <Col lg={7} md={24}>
                        <UserInfo user={this.state.user} avatar={this.state.user.avatar ? API.domain+":"+API.port+ "/api/"+this.state.user.avatar : undefined}/>
                    </Col>
                    <Col lg={17} md={24}>
                        <Tabs type="line" className="PanelWorkspace" tabBarStyle={{marginBottom: 0}} size={"large"} tabBarGutter={32}>
                            <TabPane tab={<span><Icon type="notification" />Notification</span>} key="1">
                                <UserNotificationCenter/>
                            </TabPane>
                            <TabPane tab="Tab Title 2" key="2">
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
import React from "react"
import {Col, message, Row} from "antd";
import './UserPanel.css';
import GetQuestionById from "../../networks/GetQuestionById";
import GetUserById from "../../networks/GetUserById";
import API from "../../networks/Endpoints";
import UserInfo from "../../components/Users/UserInfo";

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
        return (
            <div className="UserPanel">
                <Row gutter={24} >
                    <Col lg={7} md={24}>
                        {/*<UserInfo/>*/}
                        <UserInfo user={this.state.user} avatar={this.state.user.avatar ? API.domain+":"+API.port+ "/api/"+this.state.user.avatar : undefined}/>
                    </Col>
                    <Col lg={17} md={24}>
                        {/*<UserWorkspace/>*/}<div className="PanelWorkspace">2</div>
                    </Col>
                </Row>
            </div>

        );
    }
}
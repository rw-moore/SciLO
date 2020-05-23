import React from 'react';
import {Divider, Tabs} from 'antd';
import UserIcon from "./UserIcon";
import NotificationMessage from "./NotificationMessage";

const { TabPane } = Tabs;

export default class UserNotificationCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'top',
        };
    }

    render() {
        return (
            <div>
                <Tabs defaultActiveKey="1" tabPosition="left" style={{ height: "calc(100vh - 140px)" }} hideAdd>
                    {[...Array(12).keys()].map(i => (
                        <TabPane tab={<UserIcon/>} key={i} >
                            <div style={{marginLeft: -24}}>
                                <div style={{height: "calc(100vh - 295px)"}} className="NotificationMessage">
                                    <NotificationMessage/>
                                </div>
                                <Divider dashed style={{marginTop: 4, marginBottom: 0}}/>
                                <div style={{height: "145px"}} className="NotificationInput">
                                </div>
                            </div>
                        </TabPane>
                    ))}
                </Tabs>
            </div>
        );
    }
}

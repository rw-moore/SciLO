import React from 'react';
import { SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Col, message, Row, Tabs } from 'antd';
import './UserPanel.css';
import API from '../../networks/Endpoints';
import UserInfo from '../../components/Users/UserInfo';
import UserInfoUpdateForm from '../../components/Forms/UserInfoUpdateForm';
import UserPreferencesUpdateForm from '../../components/Forms/UserPreferencesUpdateForm';
import GetUserByUsername from '../../networks/GetUserByUsername';
import CheckUsername from '../../networks/CheckUsername';
import NotFoundException from '../Exceptions/404';

/**
 * User homepage
 */
export default class UserPanel extends React.Component {
	state = {
		user: {},
		loading: true,
	};

	componentDidMount() {
		/* search if the enter username exists*/
		const callback = (result) => {
			if (result === 'This username has been used.') {
				this.setState({ current: 1, nameStatus: 'success' });
				this.fetch();
			} else if (!result) {
				message.error('This user does not exist.');
				this.setState({ nameStatus: 'error' });
			} else {
				message.error(result);
				this.setState({ nameStatus: 'warning' });
			}
		};

		CheckUsername(this.props.name, callback);
	}

	// reload the page when the target user changes.
	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.name !== this.props.name) {
			this.fetch();
		}
	}

	fetch = () => {
		GetUserByUsername(this.props.name, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					`Cannot fetch user profile ${this.props.name}, see browser console for more details.`
				);
				this.setState({
					loading: false,
				});
			} else {
				let user = data.data.user;
				this.setState({ user: user, loading: false });
			}
		});
	};

	update = () => {
		GetUserByUsername(this.props.name, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					`Cannot fetch user profile ${this.props.name}, see browser console for more details.`
				);
				this.setState({
					loading: false,
				});
			} else {
				let user = data.data.user;
				this.setState({ user: user, loading: false });
				this.props.updateUserInfo(user);
			}
		});
	};

	render() {
		const TabPane = Tabs.TabPane;
		if (this.state.nameStatus === 'error') {
			return <NotFoundException />;
		}
		return (
			<div className="UserPanel">
				<Row gutter={24}>
					<Col lg={7} md={24}>
						<UserInfo
							loading={this.state.loading}
							user={this.state.user}
							avatar={
								this.state.user.avatar
									? API.domain + this.state.user.avatar
									: undefined
							}
						/>
					</Col>
					<Col lg={17} md={24}>
						<Tabs
							type="line"
							className="PanelWorkspace"
							tabBarStyle={{ marginBottom: 0 }}
							size={'large'}
							tabBarGutter={32}
						>
							{/*<TabPane*/}
							{/*tab={<span><Icon type="notification" />Notification</span>}*/}
							{/*key="1"*/}
							{/*>*/}
							{/*<UserNotificationCenter/>*/}
							{/*</TabPane>*/}
							{!!this.props.updateUserInfo && (
								<TabPane
									tab={
										<span>
											<UserOutlined />
											My Profile
										</span>
									}
									disabled={this.state.loading}
									key="2"
								>
									<div style={{ marginTop: 32 }}>
										<UserInfoUpdateForm
											user={this.state.user}
											token={this.props.token}
											refresh={this.update}
										/>
									</div>
								</TabPane>
							)}
							{!!this.props.updateUserInfo && (
								<TabPane
									tab={
										<span>
											<SafetyOutlined />
											User Preferences
										</span>
									}
									disabled={this.state.loading}
									key="3"
								>
									<div style={{ marginTop: 32 }}>
										<UserPreferencesUpdateForm
											user={this.state.user}
											token={this.props.token}
											refresh={this.update}
										/>
									</div>
								</TabPane>
							)}
							{/*<TabPane tab="Tab Title 3" key="3"/>*/}
						</Tabs>
					</Col>
				</Row>
			</div>
		);
	}
}

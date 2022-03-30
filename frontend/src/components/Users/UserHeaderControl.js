import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Popover, Tag } from 'antd';
import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { Link } from 'react-router-dom';
import API from '../../networks/Endpoints';
import GetInitial from '../../utils/GetInitial';
import PrintObject from '../PrintObject';
import UserIcon from './UserIcon';

/**
 * user control (after login) on the top right header
 */
export default class UserHeaderControl extends React.Component {
	state = {
		showOverlay: false,
	};

	changeVisibility = (visible) => {
		this.setState({ showOverlay: visible });
	};

	rendericon = () => {
		if (this.props.user.avatarurl) {
			return (
				<UserIcon
					user={GetInitial(this.props.user)}
					src={this.props.user.avatarurl}
				/>
			);
		} else {
			return (
				<UserIcon
					user={GetInitial(this.props.user)}
					src={
						this.props.user.avatar
							? API.domain + this.props.user.avatar
							: undefined
					}
				/>
			);
		}
	};

	render() {
		const Overlay = (
			<Menu>
				<Menu.Item>
					<Link to={'/User'}>
						<Button
							size="small"
							icon={<UserOutlined />}
							type={'link'}
						>
							My Profile
						</Button>
					</Link>
				</Menu.Item>
				<Menu.Item>
					{this.props.user.Google ? (
						<Button
							style={{ color: 'red' }}
							size="small"
							icon={<LogoutOutlined />}
							type={'link'}
							onClick={this.props.signOut}
						>
							Sign Out
						</Button>
					) : (
						<GoogleLogout
							clientId="216032897049-hvr6e75vc4cnb4ulvblh2vq97jqhke75.apps.googleusercontent.com"
							onLogoutSuccess={this.props.signOut}
							render={(renderProps) => (
								<Button
									style={{ color: 'red' }}
									size="small"
									icon={<LogoutOutlined />}
									type={'link'}
									onClick={renderProps.onClick}
									disabled={renderProps.disabled}
								>
									Sign Out
								</Button>
							)}
						/>
					)}
				</Menu.Item>
			</Menu>
		);

		return (
			<div>
				<Dropdown
					overlay={Overlay}
					trigger={['click']}
					visible={this.state.showOverlay}
					onVisibleChange={this.changeVisibility}
				>
					<span
						style={this.props.style}
						onClick={() => {
							this.changeVisibility(!this.state.showOverlay);
						}}
					>
						{this.rendericon()}
					</span>
				</Dropdown>
				<Popover content={<PrintObject>{this.props.user}</PrintObject>}>
					<Tag style={{ ...this.props.style, top: 'auto' }}>
						{getRole(this.props.user)}
					</Tag>
				</Popover>
			</div>
		);
	}
}

function getRole(user) {
	if (user.is_staff) {
		return 'Admin';
	}
	// TODO: change role base on the last course clicked into
	else {
		return 'User';
	}
}

import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { googleLogout } from '@react-oauth/google';
import { Button, Dropdown, Menu, Popover, Tag } from 'antd';
import React from 'react';
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
			return <UserIcon user={GetInitial(this.props.user)} src={this.props.user.avatarurl} />;
		} else {
			return (
				<UserIcon
					user={GetInitial(this.props.user)}
					src={this.props.user.avatar ? API.domain + this.props.user.avatar : undefined}
				/>
			);
		}
	};

	signOut = () => {
		if (this.props.user.Google) {
			googleLogout();
		}
		this.props.signOut();
	};

	render() {
		const overlayItems = [
			{
				key: 'profile',
				icon: <UserOutlined />,
				label: (
					<Link to={'/User'}>
						<Button size="small" type={'link'}>
							My Profile
						</Button>
					</Link>
				),
			},
			{
				key: 'logout',
				icon: <LogoutOutlined />,
				style: { color: 'red' },
				label: (
					<Button size="small" type={'link'} onClick={this.signOut}>
						Sign Out
					</Button>
				),
			},
		];

		return (
			<div>
				<Dropdown
					overlay={<Menu items={overlayItems} />}
					trigger={['click']}
					open={this.state.showOverlay}
					onOpenChange={this.changeVisibility}
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

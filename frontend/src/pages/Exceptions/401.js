import React from 'react';
import { Alert, Divider } from 'antd';
import LoginForm from '../../components/Forms/LoginForm';

/**
 * Shown to user if request login
 */
export default class UnauthorizedException extends React.Component {
	render() {
		return (
			<div style={{ width: '70%', marginLeft: '15%' }}>
				<Alert
					message="You need to sign in first."
					description="The page you requested needs authentication."
					type="error"
					showIcon
				/>
				<Divider />
				<div>
					<LoginForm
						setUser={this.props.setUser}
						restrictions={this.props.restrictions}
					/>
				</div>
			</div>
		);
	}
}

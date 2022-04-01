import React from 'react';
import { Divider } from 'antd';
import LoginForm from '../../components/Forms/LoginForm';

/**
 * Shown to user if request login
 */
export default function UnauthorizedException(props) {
	return (
		<div style={{ width: '70%', marginLeft: '15%' }}>
			{/* <Alert
					message="You need to sign in first."
					description="The page you requested needs authentication."
					type="error"
					showIcon
				/> */}
			<Divider />
			<div>
				<LoginForm
					setUser={props.setUser}
					restrictions={props.restrictions}
				/>
			</div>
		</div>
	);
}

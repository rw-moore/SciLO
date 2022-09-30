import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import React from 'react';
import LoginForm from '../Forms/LoginForm';

/**
 * the user login button on the top right header
 */
export default function Login(props) {
	const [showOverlay, setShowOverlay] = React.useState(false);

	return (
		<Dropdown
			overlay={<LoginForm setUser={props.setUser} restrictions={props.restrictions} />}
			trigger={['click']}
			open={showOverlay}
			onOpenChange={setShowOverlay}
		>
			<Button type="dashed" icon={<UserOutlined />} style={props.style}>
				Sign In
			</Button>
		</Dropdown>
	);
}

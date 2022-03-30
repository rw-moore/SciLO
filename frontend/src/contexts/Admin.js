import React from 'react';
import { UserContext } from './UserContext';

export default function Admin(props) {
	const User = React.useContext(UserContext);
	if (User?.user?.is_staff) {
		return props.children;
	} else {
		return props.fallback || <></>;
	}
}

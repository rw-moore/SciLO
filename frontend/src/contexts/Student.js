import React from 'react';
import { UserConsumer } from './UserContext';

export default function Student(props) {
	return (
		<UserConsumer>
			{(User) => {
				if (User && !User.user.is_staff && !User.user.is_instructor) {
					return props.children;
				}
				// fallback
				else {
					return props.fallback;
				}
			}}
		</UserConsumer>
	);
}

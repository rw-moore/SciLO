import React, { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	EyeInvisibleOutlined,
	EyeOutlined,
	LinkOutlined,
} from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { hasPerms } from '../../contexts/HasPermission';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

/**
 * options sub-component for quiz card
 */

export default function QuizCardOperations(props) {
	const User = React.useContext(UserContext);
	const [items, setItems] = useState([]);
	useEffect(() => {
		function getItems() {
			let items = [];
			if (hasPerms({ id: props.course, nodes: ['change_quiz'] }, User)) {
				items.push(
					{
						key: 'hide',
						icon: !props.hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />,
						label: (
							<Button onClick={props.hide} size="small" type="link">
								{!props.hidden ? 'Hide' : 'Reveal'}
							</Button>
						),
					},
					{
						key: 'edit',
						icon: <EditOutlined />,
						label: (
							<Link to={`/Quiz/edit/${props.id}`}>
								<Button size="small" type="link">
									Edit
								</Button>
							</Link>
						),
					},
					{
						key: 'link',
						icon: <LinkOutlined />,
						label: (
							<Button size="small" type="link" onClick={props.link}>
								Link for embedding
							</Button>
						),
					}
				);
			}
			if (hasPerms({ id: props.course, nodes: ['delete_quiz'] }, User)) {
				items.push({
					key: 'delete',
					icon: <DeleteOutlined />,
					label: (
						<Button
							size="small"
							type="link"
							style={{ color: 'red' }}
							onClick={props.delete}
						>
							Delete
						</Button>
					),
				});
			}
			return items;
		}
		setItems(getItems());
	}, [User, props]);

	return <Dropdown menu={{ items }}>{props.children}</Dropdown>;
}

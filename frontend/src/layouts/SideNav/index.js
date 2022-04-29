import React, { useContext, useState, useEffect } from 'react';
import {
	BookOutlined,
	DatabaseOutlined,
	FileTextOutlined,
	LeftOutlined,
	RightOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import './index.css';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const { Sider } = Layout;
/**
 * SideNav is the responsive collapsible side navigation bar on the left
 */
const getTabs = (user) => {
	let output = [
		{
			key: 'Course',
			icon: <BookOutlined />,
			label: (
				<Link to={'/Course'}>
					<span className="nav-text">Course</span>
				</Link>
			),
		},
		{
			key: 'Quiz',
			icon: <FileTextOutlined />,
			label: (
				<Link to={'/Quiz'}>
					<span className="nav-text">Quiz</span>
				</Link>
			),
		},
		{
			key: 'User',
			icon: <UserOutlined />,
			label: (
				<Link to={'/User'}>
					<span className="nav-text">User</span>
				</Link>
			),
		},
	];
	if (user.is_staff || user.can_view_questionbank) {
		output.splice(2, 0, {
			key: 'QuestionBank',
			icon: <DatabaseOutlined />,
			label: (
				<Link to={'/QuestionBank'}>
					<span className="nav-text">Question Bank</span>
				</Link>
			),
		});
	}
	return output;
};
const SideNav = () => {
	const User = useContext(UserContext);
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const [tab, setTab] = useState(location.pathname.split('/')[1]);
	const [options, setOptions] = useState(User?.user ? getTabs(User.user) : []);
	useEffect(() => {
		let tab = location.pathname.split('/')[1];
		if (tab === '') {
			tab = 'User';
		}
		setTab(tab);
	}, [location]);
	useEffect(() => {
		setOptions(User?.user ? getTabs(User.user) : []);
	}, [User]);
	return (
		<Sider
			className="SideNav"
			breakpoint="lg"
			collapsedWidth="0"
			collapsible
			zeroWidthTriggerStyle={{ bottom: 11, top: 'auto' }}
			trigger={collapsed ? <RightOutlined /> : <LeftOutlined />}
			onBreakpoint={(broken) => {
				//console.log(broken);
			}}
			onCollapse={(collapsed, type) => {
				//console.log(collapsed, type);
				setCollapsed(collapsed);
			}}
		>
			{User && (
				<Menu
					theme="dark"
					mode="inline"
					defaultSelectedKeys={['User']}
					selectedKeys={[tab]}
					items={options}
				/>
			)}
		</Sider>
	);
};

export default SideNav;

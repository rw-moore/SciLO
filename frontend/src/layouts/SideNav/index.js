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
const SideNav = () => {
	const User = useContext(UserContext);
	const [collapsed, setCollapsed] = useState(false);
	const location = useLocation();
	const [tab, setTab] = useState(location.pathname.split('/')[1]);
	useEffect(() => {
		let tab = location.pathname.split('/')[1];
		if (tab === '') {
			tab = 'User';
		}
		setTab(tab);
	}, [location]);
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
			{User &&
				(User.user.is_staff || User.user.can_view_questionbank ? (
					<Menu
						theme="dark"
						mode="inline"
						defaultSelectedKeys={['User']}
						selectedKeys={[tab]}
					>
						<Menu.Item key="Course">
							<Link to={'/Course'}>
								<BookOutlined />
								<span className="nav-text">Course</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="Quiz">
							<Link to={'/Quiz'}>
								<FileTextOutlined />
								<span className="nav-text">Quiz</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="QuestionBank">
							<Link to={'/QuestionBank'}>
								<DatabaseOutlined />
								<span className="nav-text">Question Bank</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="User">
							<Link to={'/User'}>
								<UserOutlined />
								<span className="nav-text">User</span>
							</Link>
						</Menu.Item>
					</Menu>
				) : (
					<Menu
						theme="dark"
						mode="inline"
						defaultSelectedKeys={['4']}
						selectedKeys={[tab]}
					>
						<Menu.Item key="Course">
							<Link to={'/Course'}>
								<BookOutlined />
								<span className="nav-text">Course</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="Quiz">
							<Link to={'/Quiz'}>
								<FileTextOutlined />
								<span className="nav-text">Quiz</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="User">
							<Link to={'/User'}>
								<UserOutlined />
								<span className="nav-text">User</span>
							</Link>
						</Menu.Item>
					</Menu>
				))}
		</Sider>
	);
};

export default SideNav;

import React, { useContext, useState } from 'react';
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
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const { Sider } = Layout;
/**
 * SideNav is the responsive collapsible side navigation bar on the left
 */
const SideNav = () => {
	const User = useContext(UserContext);
	const [collapsed, setCollapsed] = useState(false);

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
						defaultSelectedKeys={['4']}
					>
						<Menu.Item key="1">
							<Link to={'/Course'}>
								<BookOutlined />
								<span className="nav-text">Course</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="2">
							<Link to={'/Quiz'}>
								<FileTextOutlined />
								<span className="nav-text">Quiz</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="3">
							<Link to={'/QuestionBank'}>
								<DatabaseOutlined />
								<span className="nav-text">Question Bank</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="4">
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
					>
						<Menu.Item key="1">
							<Link to={'/Course'}>
								<BookOutlined />
								<span className="nav-text">Course</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="2">
							<Link to={'/Quiz'}>
								<FileTextOutlined />
								<span className="nav-text">Quiz</span>
							</Link>
						</Menu.Item>
						<Menu.Item key="4">
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

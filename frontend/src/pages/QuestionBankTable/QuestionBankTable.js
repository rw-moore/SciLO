import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
	SearchOutlined,
	UploadOutlined,
} from '@ant-design/icons';
// import Highlighter from 'react-highlight-words';
import {
	Button,
	Divider,
	Drawer,
	Input,
	message,
	Modal,
	Popconfirm,
	Table,
	Tag,
	Tooltip,
	Typography,
	Upload,
} from 'antd';
import moment from 'moment';
import React, { createRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QuickLook from '../../components/QuestionPreviews/QuickLook';
import Spoiler from '../../components/Spoiler';
import HasPermission from '../../contexts/HasPermission';
import DeleteQuestion from '../../networks/DeleteQuestion';
import GetCourses from '../../networks/GetCourses';
import GetQuestions from '../../networks/GetQuestions';
import GetTags from '../../networks/GetTags';
import ExportQuestion from '../../utils/exportQuestion';
import RandomColorBySeed from '../../utils/RandomColorBySeed';
import UploadQuestions from '../../utils/UploadQuestions';
import './index.css';

const QuestionBankTable = (props) => {
	const [searchText, setSearchText] = useState('');
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [data, setData] = useState([]);
	const [tags, setTags] = useState([]);
	const [courses, setCourses] = useState([]);
	const [filteredInfo, setFilteredInfo] = useState({});
	const [sortedInfo, setSortedInfo] = useState({});
	const [pagination, setPagination] = useState({
		hideOnSinglePage: false,
		showSizeChanger: true,
		defaultPageSize: 10,
		pageSizeOptions: ['10', '20', '50', '100'],
	});
	const [loading, setLoading] = useState(false);
	const [columns, setColumns] = useState(
		props.columns || [
			'descriptor',
			'course',
			'text',
			'responses',
			'tags',
			'actions',
		]
	);
	const [quickLook, setQuickLook] = useState({
		visible: false,
		question: null,
	});
	let searchInput = createRef(null);

	const fetch = (params = {}) => {
		setLoading(true);
		GetQuestions(props.token, params).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch questions, see browser console for more details.'
				);
				setLoading(false);
			} else {
				const pager = { ...pagination };
				pager.total = data.data.length;
				setLoading(false);
				setData(data.data.questions);
				setPagination(pager);
			}
		});
		GetTags(props.token, params).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch tags, see browser console for more details.'
				);
			} else {
				setTags(data.data.tags);
			}
		});
		GetCourses(props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch courses, see browser console for more details.'
				);
			} else {
				setCourses(data.data);
			}
		});
	};

	useEffect(() => {
		fetch({
			...props.defaultFetch,
			results: pagination.defaultPageSize,
			page: 1,
		});
	}, []);

	const handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...pagination };
		pager.current = pagination.current;

		setPagination(pager);
		setFilteredInfo(filters);
		setSortedInfo(sorter);

		fetch({
			...props.defaultFetch,
			results: pagination.pageSize,
			page: pagination.current,
			sortField: sorter.field,
			sortOrder: sorter.order,
			...filters,
		});
	};

	const deleteQuestion = (id) => {
		setLoading(true);
		DeleteQuestion(id, props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot delete questions, see browser console for more details.'
				);
				setLoading(false);
			} else {
				fetch({
					...props.defaultFetch,
					results: pagination.defaultPageSize,
					page: 1,
				});
			}
		});
	};

	const exportQuestion = () => {
		const questions = data.filter(
			(entry) =>
				selectedRowKeys.length < 1 || selectedRowKeys.includes(entry.id)
		);
		ExportQuestion(questions);
	};

	const onSelectChange = (selectedKeys) => {
		setSelectedRowKeys(selectedKeys);
		if (props.update) {
			props.update(selectedKeys);
		}
	};

	const handleSearch = (selectedKeys, confirm) => {
		confirm();
		setSearchText(selectedKeys[0]);
	};

	const handleReset = (clearFilters) => {
		clearFilters();
		setSearchText('');
	};

	const getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={(node) => {
						searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() => handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: 'block' }}
				/>
				<Button
					type="primary"
					onClick={() => handleSearch(selectedKeys, confirm)}
					icon={<SearchOutlined />}
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button
					onClick={() => handleReset(clearFilters)}
					size="small"
					style={{ width: 90 }}
				>
					Reset
				</Button>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined
				style={{ color: filtered ? '#1890ff' : undefined }}
			/>
		),
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.select());
			}
		},
	});

	const deleteSelected = () => {
		let selected = selectedRowKeys;
		selected.forEach((id) => {
			deleteQuestion(id);
		});
		setSelectedRowKeys([]);
	};

	const onClose = () => {
		setQuickLook({
			visible: false,
			question: null,
		});
	};

	const quickLookQuestion = (question) => {
		setQuickLook({
			visible: true,
			question: question,
		});
	};

	const deleteConfirm = () => {
		Modal.confirm({
			title: 'Delete',
			content: 'Are you sure?',
			onOk: deleteSelected,
			onCancel() {},
		});
	};

	const openPreview = (id) => {
		window.open(
			`${props.url}/preview/${id}`,
			'',
			'width=600,height=600,left=200,top=200'
		);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	};

	const hasSelected = selectedRowKeys.length > 0;

	const renderColumns = [
		// Descriptor
		{
			title: 'Descriptor',
			dataIndex: 'descriptor',
			key: 'descriptor',
			sorter: (a, b) =>
				a.descriptor.localeCompare(b.descriptor, 'en', {
					sensitivity: 'base',
				}),
			sortOrder:
				sortedInfo.columnKey === 'descriptor' && sortedInfo.order,
			render: (descriptor, record) => (
				<Button
					type={'link'}
					block={true}
					style={{
						height: 'auto',
						whiteSpace: 'normal',
					}}
					onClick={() => {
						quickLookQuestion(record);
					}}
				>
					{descriptor}
					{/*<Highlighter*/}
					{/*highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}*/}
					{/*searchWords={[this.state.searchText]}*/}
					{/*autoEscape*/}
					{/*textToHighlight={title}*/}
					{/*/>*/}
				</Button>
			),
			width: '25%',
			...getColumnSearchProps('descriptor'),
		},
		// Text
		{
			title: 'Text',
			dataIndex: 'text',
			key: 'text',
			width: '25%',
			render: (text) => (
				<Spoiler>{text}</Spoiler>
				// <Highlighter
				//     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
				//     searchWords={[this.state.searchText]}
				//     autoEscape
				//     textToHighlight={}
				// />
			),
			...getColumnSearchProps('text'),
		},
		// Number of responses
		{
			title: <Tooltip title="number of responses">#</Tooltip>,
			key: 'responses',
			dataIndex: 'responses',
			width: '4%',
			sorter: (a, b) => a.length - b.length,
			sortOrder: sortedInfo.columnKey === 'responses' && sortedInfo.order,
			render: (responses) => <span>{responses.length}</span>,
		},
		// Course
		{
			title: 'Course',
			key: 'courses',
			dataIndex: 'course',
			width: '6%',
			render: (course) => (
				<span>
					<Tag color={RandomColorBySeed(course).bg}>
						<span style={{ color: RandomColorBySeed(course).fg }}>
							{courses.find((c) => c.id === course)
								? courses.find((c) => c.id === course).shortname
								: undefined}
						</span>
					</Tag>
				</span>
			),
			filters: [
				{
					text: (
						<span style={{ color: 'red' }}>
							Only Show Non-course Questions
						</span>
					),
					value: '-1',
				},
			].concat(
				courses.map((course) => ({
					text: course.shortname,
					value: course.id,
				}))
			),
			filteredValue: filteredInfo.name,
		},
		// Tags
		{
			title: 'Tags',
			key: 'tags',
			dataIndex: 'tags',
			width: '20%',
			render: (tags) => (
				<span>
					{tags.map((tag) => {
						tag = tag.name;
						let color = tag.length > 5 ? 'geekblue' : 'green';
						if (tag === 'difficult') {
							color = 'volcano';
						}
						return (
							<Tag color={color} key={tag}>
								{tag}
							</Tag>
						);
					})}
				</span>
			),
			filterSearch: true,
			filters: [
				{
					text: (
						<span style={{ color: 'red' }}>
							Only Show Untagged Questions
						</span>
					),
					value: '-1',
				},
			].concat(
				tags.map((tag) => ({
					text: tag.name,
					value: tag.id,
				}))
			),
			filteredValue: filteredInfo.name,
		},
		// Author
		{
			title: 'Author',
			key: 'author',
			dataIndex: 'author',
			width: '10%',
			render: (owner) => <span>{owner}</span>,
		},
		// Create date
		{
			title: 'Create Date',
			key: 'create_date',
			dataIndex: 'create_date',
			sorter: (a, b) => moment(a).isBefore(b),
			sortOrder:
				sortedInfo.columnKey === 'create_date' && sortedInfo.order,
			render: (datetime) => (
				<span>{moment.utc(datetime).format('ll')}</span>
			),
		},
		// Last modified
		{
			title: 'Last Modified',
			key: 'last_modify_date',
			dataIndex: 'last_modify_date',
			sorter: (a, b) => moment(a).isBefore(b),
			sortOrder:
				sortedInfo.columnKey === 'last_modify_date' && sortedInfo.order,
			render: (datetime) => (
				<span>{moment.utc(datetime).format('ll')}</span>
			),
		},
		// Quizzes
		{
			title: 'Quizzes',
			key: 'quizzes',
			dataIndex: 'quizzes',
			render: (quizzes) => (
				<Tooltip title={quizzes.toString()}>{quizzes.length}</Tooltip>
			),
		},
		// Actions
		{
			title: 'Actions',
			key: 'actions',
			width: '10%',
			render: (text, record) => {
				const edit = (
					<Link to={`${props.url}/edit/${record.id}`}>
						<Button type="link" icon={<EditOutlined />} />
					</Link>
				);
				const preview = (
					<Button
						onClick={() => openPreview(record.id)}
						type="link"
						icon={<SearchOutlined />}
					/>
				);
				const del = (
					<Popconfirm
						title="Delete forever?"
						icon={
							<QuestionCircleOutlined style={{ color: 'red' }} />
						}
						onConfirm={() => {
							deleteQuestion(record.id);
						}}
					>
						<DeleteOutlined style={{ color: 'red' }} />
					</Popconfirm>
				);
				return (
					<span>
						{!props.hideActions?.includes('edit') ? (
							props.usePerms ? (
								<HasPermission
									id={props.course.id}
									nodes={['change_question']}
								>
									{edit}
								</HasPermission>
							) : (
								edit
							)
						) : (
							<></>
						)}
						<Divider type="vertical" />
						{!props.hideActions?.includes('preview') ? (
							props.usePerms ? (
								<HasPermission
									id={props.course.id}
									nodes={['change_question']}
								>
									{preview}
								</HasPermission>
							) : (
								preview
							)
						) : (
							<></>
						)}
						<Divider type="vertical" />
						{!props.hideActions?.includes('delete') ? (
							props.usePerms ? (
								<HasPermission
									id={props.course.id}
									nodes={['change_question']}
								>
									{del}
								</HasPermission>
							) : (
								del
							)
						) : (
							<></>
						)}
					</span>
				);
			},
		},
	];
	const create = (
		<Button.Group>
			<Link to={`${props.url}/new`}>
				<Button icon={<PlusOutlined />} type="primary">
					New
				</Button>
			</Link>
			<Upload
				beforeUpload={(file, fileList) =>
					UploadQuestions(file, fileList, props.token, () =>
						fetch({
							...props.defaultFetch,
							results: pagination.defaultPageSize,
							page: 1,
						})
					)
				}
				showUploadList={false}
				accept=".json"
			>
				<Button
					// style={{ position: 'relative', top: 2 }}
					icon={<UploadOutlined />}
				/>
			</Upload>
			<Button
				icon={<DownloadOutlined />}
				// style={{ margin: '0 0 0 16px' }}
				onClick={exportQuestion}
			>
				Export {hasSelected && 'Selected'}
			</Button>
		</Button.Group>
	);
	return (
		<div className="QuestionTable">
			<Typography.Title level={3}>Question Bank</Typography.Title>
			<Table
				bordered={true}
				size="small"
				rowSelection={rowSelection}
				columns={renderColumns.filter((col) =>
					columns.includes(col.key)
				)}
				dataSource={data}
				pagination={pagination}
				loading={loading}
				onChange={handleTableChange}
				rowKey={(question) => question.id}
				scroll={{ y: '68vh' }}
				style={{ backgroundColor: 'white' }}
			/>
			<Divider dashed style={{ margin: '0px 0px 12px 0px' }} />
			{!props.hideButtons && (
				<>
					{props.usePerms ? (
						<HasPermission
							id={props.course.id}
							nodes={['add_question']}
						>
							{create}
						</HasPermission>
					) : (
						create
					)}
					{hasSelected && (
						<Button
							icon={<DeleteOutlined />}
							type="danger"
							style={{ float: 'right' }}
							onClick={deleteConfirm}
						>
							Delete
						</Button>
					)}
				</>
			)}
			<Drawer
				width={640}
				placement="right"
				closable={true}
				mask={false}
				onClose={onClose}
				visible={quickLook.visible}
				destroyOnClose
			>
				{quickLook.question && (
					<QuickLook
						question={quickLook.question}
						courses={courses}
					/>
				)}
			</Drawer>
		</div>
	);
};

export default QuestionBankTable;

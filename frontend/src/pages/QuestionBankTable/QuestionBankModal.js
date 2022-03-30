import React from 'react';
import Highlighter from 'react-highlight-words';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import GetQuestions from '../../networks/GetQuestions';
import GetTags from '../../networks/GetTags';
import './index.css';
import Spoiler from '../../components/Spoiler';
import RandomColorBySeed from '../../utils/RandomColorBySeed';
import GetCourses from '../../networks/GetCourses';
import ExportQuestion from '../../utils/exportQuestion';

/**
 * Question table for the question bank section in a modal
 */
export default class QuestionBankModal extends React.Component {
	state = {
		searchText: '',
		selectedRowKeys: [],
		data: [],
		tags: [],
		courses: [],
		filteredInfo: {},
		pagination: {
			hideOnSinglePage: true,
			showSizeChanger: true,
			defaultPageSize: 20,
			pageSizeOptions: ['10', '20', '50', '100'],
		},
		loading: false,
		columns: [
			'descriptor',
			'course',
			'text',
			'author',
			'responses',
			'tags',
			'actions',
		],
		selectedRowData: {},
	};

	componentDidMount() {
		this.setState({ selectedRowKeys: this.props.keys });
		this.fetch({
			results: this.state.pagination.defaultPageSize,
			page: 1,
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		delete Object.assign(filters, { courses: filters['course'] })['course'];
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;

		this.setState({
			pagination: pager,
			filteredInfo: filters,
			sortedInfo: sorter,
		});

		this.fetch({
			results: pagination.pageSize,
			page: pagination.current,
			sortField: sorter.field,
			sortOrder: sorter.order,
			...filters,
		});
	};

	fetch = (params = {}) => {
		this.setState({ loading: true });
		GetQuestions(this.props.token, params).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch questions, see browser console for more details.'
				);
				this.setState({
					loading: false,
				});
			} else {
				const pagination = { ...this.state.pagination };
				pagination.total = data.data.length;
				data.data.questions.forEach(
					(question) => (question.id = question.id.toString())
				);
				this.setState({
					loading: false,
					data: data.data.questions,
					pagination,
				});
			}
		});
		GetTags(this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch tags, see browser console for more details.'
				);
			} else {
				this.setState({
					tags: data.data.tags,
				});
			}
		});
		GetCourses(this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch courses, see browser console for more details.'
				);
			} else {
				this.setState({
					courses: data.data,
				});
			}
		});
	};

	export = () => {
		const questions = this.state.data.filter(
			(entry) =>
				this.state.selectedRowKeys.length < 1 ||
				this.state.selectedRowKeys.includes(entry.id)
		);
		ExportQuestion(questions);
	};

	onOk = () => {
		this.props.update(this.state.selectedRowKeys);
		this.props.close();
	};

	onCancel = () => {
		this.props.close();
	};

	onSelectChange = (selectedRowKeys) => {
		//console.log('selectedRowKeys changed: ', selectedRowKeys);
		this.setState({ selectedRowKeys });
	};

	getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={(node) => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() =>
						this.handleSearch(selectedKeys, confirm)
					}
					style={{ width: 188, marginBottom: 8, display: 'block' }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon={<SearchOutlined />}
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button
					onClick={() => this.handleReset(clearFilters)}
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
				setTimeout(() => this.searchInput.select());
			}
		},
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = (clearFilters) => {
		clearFilters();
		this.setState({ searchText: '' });
	};

	openPreview = (id) => {
		window.open(
			`/Questionbank/preview/${id}`,
			'',
			'width=600,height=600,left=200,top=200'
		);
	};

	render() {
		let { sortedInfo } = this.state;
		sortedInfo = sortedInfo || {};
		const selectedRowKeys = this.state.selectedRowKeys || [];
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange,
		};
		const hasSelected = selectedRowKeys.length > 0;

		const columns = [
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
							this.props.setQuickLook(record);
						}}
					>
						<Highlighter
							highlightStyle={{
								backgroundColor: '#ffc069',
								padding: 0,
							}}
							searchWords={[this.state.searchText]}
							autoEscape
							textToHighlight={descriptor}
						/>
					</Button>
				),
				width: '25%',
				...this.getColumnSearchProps('descriptor'),
			},
			{
				title: 'Text',
				dataIndex: 'text',
				key: 'text',
				width: '23%',
				render: (text) => (
					<Spoiler>{text}</Spoiler>
					// <Highlighter
					//     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					//     searchWords={[this.state.searchText]}
					//     autoEscape
					//     textToHighlight={}
					// />
				),
				...this.getColumnSearchProps('text'),
			},
			{
				title: <Tooltip title="number of responses">#</Tooltip>,
				key: 'responses',
				dataIndex: 'responses',
				width: '4%',
				sorter: (a, b) => a.length - b.length,
				sortOrder:
					sortedInfo.columnKey === 'responses' && sortedInfo.order,
				render: (responses) => <span>{responses.length}</span>,
			},
			{
				title: 'Course',
				key: 'course',
				dataIndex: 'course',
				width: '11%',
				render: (course) => (
					<span>
						<Tag color={RandomColorBySeed(course).bg}>
							<span
								style={{ color: RandomColorBySeed(course).fg }}
							>
								{this.state.courses.find((c) => c.id === course)
									? this.state.courses.find(
											(c) => c.id === course
									  ).shortname
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
					this.state.courses.map((course) => ({
						text: course.shortname,
						value: course.id,
					}))
				),
				filteredValue: this.state.filteredInfo.name,
			},
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
					this.state.tags.map((tag) => ({
						text: tag.name,
						value: tag.id,
					}))
				),
				filteredValue: this.state.filteredInfo.name,
			},
			{
				title: 'Author',
				key: 'author',
				width: '10%',
				dataIndex: 'author',
				render: (author) => <span>{author}</span>,
			},
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
			{
				title: 'Last Modified',
				key: 'last_modify_date',
				dataIndex: 'last_modify_date',
				sorter: (a, b) => moment(a).isBefore(b),
				sortOrder:
					sortedInfo.columnKey === 'last_modify_date' &&
					sortedInfo.order,
				render: (datetime) => (
					<span>{moment.utc(datetime).format('ll')}</span>
				),
			},
			{
				title: 'Quizzes',
				key: 'quizzes',
				dataIndex: 'quizzes',
				render: (quizzes) => (
					<Tooltip title={quizzes.toString()}>
						{quizzes.length}
					</Tooltip>
				),
			},
			{
				title: 'Actions',
				key: 'actions',
				width: '6%',
				render: (text, record) => (
					<span>
						<Button
							onClick={() => this.openPreview(record.id)}
							type="link"
							icon={<SearchOutlined />}
						/>
					</span>
				),
			},
		];

		return (
			<Modal
				className="QuestionTable"
				title="QuestionBank"
				visible={this.props.visible}
				onOk={this.onOk}
				onCancel={this.onCancel}
				width="80%"
				style={{ top: 64 }}
				destroyOnClose
			>
				{/*<Select*/}
				{/*value={this.state.columns}*/}
				{/*mode={"multiple"}*/}
				{/*style={{width: "100%"}}*/}
				{/*onChange={(e)=>{this.setState({columns: e})}}*/}
				{/*>*/}
				{/*{columns.map(col=>(<Option key={col.key}>{col.key}</Option>))}*/}
				{/*</Select>*/}
				<Table
					bordered
					size="small"
					rowSelection={rowSelection}
					columns={columns.filter((col) =>
						this.state.columns.includes(col.key)
					)}
					dataSource={this.state.data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					onChange={this.handleTableChange}
					rowKey={(question) => question.id}
					scroll={{ y: '60vh' }}
					//style={{borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}}
				/>
				{
					<Button
						icon={<DownloadOutlined />}
						style={{ position: 'absolute', bottom: '12px' }}
						onClick={this.export}
					>
						Export{hasSelected && ' Selected'}
					</Button>
				}
			</Modal>
		);
	}
}

import React from "react";

import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';

// import Highlighter from 'react-highlight-words';
import { Button, Divider, Drawer, Input, message, Modal, Popconfirm, Table, Tag, Tooltip, Typography, Upload } from "antd";
import moment from 'moment';
import {Link} from "react-router-dom";
import GetQuestions from "../../networks/GetQuestions";
import DeleteQuestion from "../../networks/DeleteQuestion";
import GetTags from "../../networks/GetTags";
import "../../pages/Course/index.css";
import QuickLook from "../../components/QuestionPreviews/QuickLook";
import Spoiler from "../../components/Spoiler";
import HasPermission from "../../contexts/HasPermission";
import UploadQuestions from "../../utils/UploadQuestions";
import ExportQuestion from "../../utils/exportQuestion";

/**
 * Question table for the question bank section
 */
export default class CourseQuestionBank extends React.Component {
    state = {
        searchText: '',
        selectedRowKeys: [],
        data: [],
        tags: [],
        filteredInfo: {},
        pagination: {
            showSizeChanger: true,
            hideOnSinglePage: true,
            defaultPageSize: 10,
            pageSizeOptions: ['10','20','50','100']
        },
        loading: false,
        columns: ['title', 'text', 'author', 'responses', 'tags', 'actions'],
        QuickLook: {
            visible: false,
            question: null
        }
    };

    componentDidMount() {
        this.fetch({
            courses: [this.props.course],
            results: this.state.pagination.defaultPageSize,
            page: 1,
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;

        this.setState({
            pagination: pager,
            filteredInfo: filters,
            sortedInfo: sorter,
        });

        this.fetch({
            courses: [this.props.course],
            results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    };

    fetch = (params = {}) => {
        this.setState({ loading: true });
        GetQuestions(this.props.token, params).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch questions, see browser console for more details.");
                this.setState({
                    loading: false
                })
            }
            else {
                const pagination = { ...this.state.pagination };
                pagination.total = data.data.length;
                this.setState({
                    loading: false,
                    data: data.data.questions,
                    pagination,
                });
            }
        });
        GetTags(this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch tags, see browser console for more details.");
                }
                else {
                    this.setState({
                        tags: data.data.tags
                    });
                }
            }
        );

    };

    delete = (id) => {
        this.setState({ loading: true });
        DeleteQuestion(id, this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot delete questions, see browser console for more details.");
                this.setState({
                    loading: false
                })
            }
            else {
                this.fetch({
                    courses: [this.props.course],
                    results: this.state.pagination.defaultPageSize,
                    page: 1,
                });
            }
        });
    };

    export = () => {
        const questions = this.state.data.filter((entry)=>(this.state.selectedRowKeys.length < 1 || this.state.selectedRowKeys.includes(entry.id)));
        ExportQuestion(questions);
    }

    onSelectChange = selectedRowKeys => {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
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
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    deleteSelected = () => {
        let selected = this.state.selectedRowKeys;
        selected.forEach(id=>{
            this.delete(id);
        });
        this.setState({selectedRowKeys: []});
    };

    onClose = () => {
        this.setState({
            QuickLook: {
                visible: false,
                question: null
            }
        })
    };

    quickLookQuestion = (question) => {
        this.setState({
            QuickLook: {
                visible: true,
                question: question
            }
        })
    };

    deleteConfirm = () => {
        Modal.confirm({
            title: 'Delete',
            content: 'Are you sure?',
            onOk: this.deleteSelected,
            onCancel() {}
        });
    };


    render() {
        let { sortedInfo } = this.state;
        sortedInfo = sortedInfo || {};
        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const hasSelected = selectedRowKeys.length > 0;

        const columns = [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                render: (title, record) => (
                    <Button type={"link"} onClick={()=>{
                        this.quickLookQuestion(record)}
                    }>
                        {title}
                        {/*<Highlighter*/}
                        {/*highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}*/}
                        {/*searchWords={[this.state.searchText]}*/}
                        {/*autoEscape*/}
                        {/*textToHighlight={title}*/}
                        {/*/>*/}
                    </Button>),
                width: "25%",
                ...this.getColumnSearchProps('title')
            },
            {
                title: 'Text',
                dataIndex: 'text',
                key: 'text',
                width: "27%",
                render: (text) => (
                    <Spoiler>{text}</Spoiler>
                    // <Highlighter
                    //     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    //     searchWords={[this.state.searchText]}
                    //     autoEscape
                    //     textToHighlight={}
                    // />
                ),
                ...this.getColumnSearchProps('text')
            },
            {
                title: <Tooltip title="number of responses">#</Tooltip>,
                key: 'responses',
                dataIndex: 'responses',
                width: "4%",
                sorter: (a, b) => a.length - b.length,
                sortOrder: sortedInfo.columnKey === 'responses' && sortedInfo.order,
                render: responses => <span>{responses.length}</span>,
            },
            {
                title: 'Author',
                key: 'author',
                dataIndex: 'author',
                width: "10%",
                render: author => (
                    <span>{author}</span>
                ),
            },
            {
                title: 'Tags',
                key: 'tags',
                dataIndex: 'tags',
                width: "20%",
                render: tags => (
                    <span>
                        {tags.map(tag => {
                            tag = tag.name;
                            let color = tag.length > 5 ? 'geekblue' : 'green';
                            if (tag === 'difficult') {
                                color = 'volcano';
                            }
                            return (
                                <Tag color={color} key={tag}>
                                    {tag.toUpperCase()}
                                </Tag>
                            );
                        })}
                    </span>
                ),
                filters: this.state.tags.map(tag=> ({text: tag.name, value: tag.id})),
                filteredValue: this.state.filteredInfo.name,
            },
            {
                title: 'Create Date',
                key: 'create_date',
                dataIndex: 'create_date',
                sorter: (a, b) => moment(a).isBefore(b),
                sortOrder: sortedInfo.columnKey === 'create_date' && sortedInfo.order,
                render: (datetime) => (
                    <span>{moment.utc(datetime).format("ll")}</span>
                )
            },
            {
                title: 'Last Modified',
                key: 'last_modify_date',
                dataIndex: 'last_modify_date',
                sorter: (a, b) => moment(a).isBefore(b),
                sortOrder: sortedInfo.columnKey === 'last_modify_date' && sortedInfo.order,
                render: (datetime) => (
                    <span>{moment.utc(datetime).format("ll")}</span>
                )
            },
            {
                title: 'Quizzes',
                key: 'quizzes',
                dataIndex: 'quizzes',
                render: (quizzes) => (
                    <Tooltip
                        title={quizzes.toString()}
                    >
                        {quizzes.length}
                    </Tooltip>
                )
            },
            {
                title: 'Actions',
                key: 'actions',
                width: "25%",
                render: (text, record) => (
                    <span>
                        <HasPermission id={this.props.course} nodes={["change_question"]}>
                            <Link to={`${this.props.url}/edit/${record.id}`}><Button type="link" icon={<EditOutlined />}/></Link>
                            <Divider type="vertical" />
                        </HasPermission>
                        <HasPermission id={this.props.course} nodes={["delete_question"]}>
                            <Popconfirm
                                title="Delete forever?"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={() => {this.delete(record.id)}}
                            >
                                <DeleteOutlined style={{ color: 'red' }} />
                            </Popconfirm>
                        </HasPermission>
                    </span>
                ),
            },
        ];

        return (
            <div className="CourseQuestions">
                <Typography.Title level={3}>
                    {`Questions`}
                    <HasPermission id={this.props.course} nodes={["add_question"]}>
                        <span style={{float: "right"}}>
                            <Link to={`/QuestionBank/new?course=${this.props.course}`} >
                                <Button icon={<PlusOutlined />} type="primary">New Question</Button>
                            </Link>
                            <Divider type={"vertical"}/>
                            <Upload
                                beforeUpload={(file, fileList)=>
                                    UploadQuestions(file, fileList, this.props.token, ()=>
                                        (this.fetch({
                                            courses: [this.props.course],
                                            results: this.state.pagination.defaultPageSize,
                                            page: 1,
                                        }))
                                    , this.props.course)}
                                showUploadList={false} accept=".json">
                                <Button icon={<UploadOutlined/>} >Upload</Button>
                            </Upload>
                        </span>
                    </HasPermission>
                </Typography.Title>
                <Table
                    bordered
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns.filter(col=>(this.state.columns.includes(col.key)))}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                    rowKey={question => question.id}
                    scroll={{ y: "80vh"}}
                    style={{
                        //borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px",
                        background:"white"}}
                />
                <Divider dashed style={{margin: "0px 0px 12px 0px"}}/>
                {hasSelected && <Button icon={<DownloadOutlined />} style={{margin: "0 0 0 16px"}} onClick={this.export}>Export Selected</Button>}
                {hasSelected && 
                    <span style={{float:"right"}}>
                        <Button onClick={this.deleteConfirm}>Delete</Button>
                    </span>
                }
                {/*<Link to={{pathname: `Quiz/new`, search: "?questions="+this.state.selectedRowKeys.toString()}}><Button icon="file" type="success" disabled={!hasSelected} style={{margin: "0 0 0 16px"}}>Generate Quiz</Button></Link>*/}
                <Drawer
                    width={640}
                    placement="right"
                    closable={true}
                    mask={false}
                    onClose={this.onClose}
                    visible={this.state.QuickLook.visible}
                    destroyOnClose
                >
                    {this.state.QuickLook.question && <QuickLook question={this.state.QuickLook.question}/>}
                </Drawer>
            </div>
        );
    }
}
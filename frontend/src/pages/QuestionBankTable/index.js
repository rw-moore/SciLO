import React from "react";
import Highlighter from 'react-highlight-words';
import {
    Button,
    Divider,
    Icon,
    Layout,
    Table,
    Tag,
    Breadcrumb,
    Menu,
    Input,
    Tooltip,
    message,
    Popconfirm,
    DatePicker,
    Modal, Select, Drawer
} from "antd";
import moment from 'moment';
//import data from "../../mocks/QuestionBankTable.js";
import {Link} from "react-router-dom";
import GetQuestions from "../../networks/GetQuestions";
import DeleteQuestion from "../../networks/DeleteQuestion";
import GetTags from "../../networks/GetTags";
import "./index.css";
import QuickLook from "../../components/QuestionPreviews/QuickLook";

/**
 * Question table for the question bank section
 */
export default class QuestionBankTable extends React.Component {
    state = {
        searchText: '',
        selectedRowKeys: [],
        data: [],
        tags: [],
        pagination: {
            showSizeChanger: true,
            defaultPageSize: 20,
            pageSizeOptions: ['10','20','50','100']
        },
        loading: false,
        columns: ['title', 'text', 'responses', 'tags', 'actions'],
        QuickLook: {
            visible: false,
            question: null
        }
    };

    componentDidMount() {
        this.fetch();
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
            results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    };

    fetch = (params = {}) => {
        this.setState({ loading: true });
        GetQuestions(params).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot fetch questions, see console for more details.");
                console.error("FETCH_FAILED", data);
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
        GetTags().then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch tags, see console for more details.");
                    console.error("FETCH_TAGS_FAILED", data);
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
        DeleteQuestion(id).then( data => {
            if (!data || data.status !== 200) {
                message.error("Cannot delete questions, see console for more details.");
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            }
            else {
                this.fetch();
            }
        });
    };


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
                    icon="search"
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
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
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

    deleteConfirm= () => {
        Modal.confirm({
            title: 'Delete',
            content: 'Are you sure?',
            onOk: this.deleteSelected,
            onCancel() {}
        });
    };


    render() {
        let { sortedInfo, filteredInfo } = this.state;
        sortedInfo = sortedInfo || {};
        filteredInfo = filteredInfo || {};
        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;

        filteredInfo = filteredInfo || {};
        const columns = [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                render: (title, record) => (
                    <Button type={"link"} onClick={()=>{this.quickLookQuestion(record)}}>
                        <Highlighter
                            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                            searchWords={[this.state.searchText]}
                            autoEscape
                            textToHighlight={title}
                        />
                    </Button>),
                width: "25%",
                ...this.getColumnSearchProps('title')
            },
            {
                title: 'Text',
                dataIndex: 'text',
                key: 'text',
                width: "33%",
                render: (text) => (
                    <Highlighter
                        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                        searchWords={[this.state.searchText]}
                        autoEscape
                        textToHighlight={text}
                    />
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
                title: 'Tags',
                key: 'tags',
                dataIndex: 'tags',
                width: "25%",
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
                filteredValue: filteredInfo.name || null,
            },
            {
                title: 'Author',
                key: 'author',
                dataIndex: 'author',
                render: author => (
                    <span>{author}</span>
                )
            },
            {
                title: 'Create Date',
                key: 'create_date',
                dataIndex: 'create_date',
                sorter: (a, b) => moment(a).isBefore(b),
                sortOrder: sortedInfo.columnKey === 'create_date' && sortedInfo.order,
                render: (datetime, record) => (
                    <span>{moment.utc(datetime).format("ll")}</span>
                )
            },
            {
                title: 'Last Modified',
                key: 'last_modify_date',
                dataIndex: 'last_modify_date',
                sorter: (a, b) => moment(a).isBefore(b),
                sortOrder: sortedInfo.columnKey === 'last_modify_date' && sortedInfo.order,
                render: (datetime, record) => (
                    <span>{moment.utc(datetime).format("ll")}</span>
                )
            },
            {
                title: 'Quizzes',
                key: 'quizzes',
                dataIndex: 'quizzes',
                render: (quizzes, record) => (
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
                        <Link to={`${this.props.url}/edit/${record.id}`}><Button type="link" icon="edit"/></Link>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="Delete forever?"
                            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                            onConfirm={() => {this.delete(record.id)}}
                        >
                            <Icon type="delete" style={{ color: 'red' }} />
                        </Popconfirm>
                    </span>
                ),
            },
        ];

        const Option = Select.Option;

        return (
            <div className="QuestionTable">
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
                    columns={columns.filter(col=>(this.state.columns.includes(col.key)))}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                    rowKey={question => question.id}
                    scroll={{ y: "68vh"}}
                    //style={{borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}}
                />
                <Divider dashed style={{margin: "0px 0px 12px 0px"}}/>
                <Link to={`${this.props.url}/new`}><Button icon="plus" type="primary">New</Button></Link>
                <Button icon="file" type="success" disabled={!hasSelected} style={{margin: "0 0 0 16px"}}>Generate Quiz</Button>
                {hasSelected && <Button icon="delete" type="danger" style={{float: "right"}} onClick={this.deleteConfirm}>Delete</Button>}
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
        )
    }
}
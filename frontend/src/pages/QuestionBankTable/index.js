import React from "react";
import Highlighter from 'react-highlight-words';
import {Button, Divider, Icon, Layout, Table, Tag, Breadcrumb, Menu, Input, Tooltip, message, Popconfirm} from "antd";
//import data from "../../mocks/QuestionBankTable.js";
import {Link} from "react-router-dom";
import GetQuestions from "../../networks/GetQuestions";
import DeleteQuestion from "../../networks/DeleteQuestion";
import GetTags from "../../networks/GetTags";

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
        loading: false
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
            if (data.status !== 200) {
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
                if (data.status !== 200) {
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
            if (data.status !== 200) {
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
        render: text => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text.toString()}
            />
        ),
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
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
                render: text => <a href="javascript:;">{text}</a>,
                width: "25%",
                ...this.getColumnSearchProps('title')
            },
            {
                title: 'Text',
                dataIndex: 'text',
                key: 'context',
                width: "33%",
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
                title: 'Actions',
                key: 'actions',
                width: "12.5%",
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

        return (
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <Table
                    size="middle"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                    rowKey={question => question.id}
                />
                <Link to={`${this.props.url}/new`}><Button icon="plus" type="primary">New</Button></Link>
                <Button icon="file" type="success" disabled={!hasSelected} style={{margin: "0 0 0 16px"}}>Generate Quiz</Button>
            </div>
        )
    }
}
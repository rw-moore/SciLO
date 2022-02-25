import { DeleteOutlined, DownloadOutlined, EditOutlined, FileOutlined, PlusOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
// import Highlighter from 'react-highlight-words';
import { Button, Divider, Drawer, Input, message, Modal, Popconfirm, Table, Tag, Tooltip, Typography, Upload } from "antd";
import moment from 'moment';
import React from "react";
import { Link } from "react-router-dom";
import QuickLook from "../../components/QuestionPreviews/QuickLook";
import Spoiler from "../../components/Spoiler";
import API from "../../networks/Endpoints";
import DeleteQuestion from "../../networks/DeleteQuestion";
import GetCourses from "../../networks/GetCourses";
import GetQuestions from "../../networks/GetQuestions";
import GetTags from "../../networks/GetTags";
import RandomColorBySeed from "../../utils/RandomColorBySeed";
import UploadQuestions from "../../utils/UploadQuestions";
import "./index.css";
import ExportQuestion from "../../utils/exportQuestion";



/**
 * Question table for the question bank section
 */
export default class QuestionBankTable extends React.Component {
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
            pageSizeOptions: ['10','20','50','100']
        },
        loading: false,
        columns: ['descriptor', 'course', 'text', 'responses', 'tags', 'actions'],
        QuickLook: {
            visible: false,
            question: null
        }
    };

    componentDidMount() {
        this.fetch({
            owners: [this.props.user],
            results: this.state.pagination.defaultPageSize,
            page: 1,
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        delete Object.assign(filters, {courses: filters["course"] })['course'];
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;

        this.setState({
            pagination: pager,
            filteredInfo: filters,
            sortedInfo: sorter,
        });

        this.fetch({
            owners: [this.props.user],
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
                data.data.questions.forEach(question=> {
                    question.question_image = question.question_image.map(file=>({...file, url:API.domain+"/api"+file.url}));
                })
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
        GetCourses(this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch courses, see browser console for more details.");
                }
                else {
                    this.setState({
                        courses: data.data
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
                    owners: [this.props.user],
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

    deleteConfirm= () => {
        Modal.confirm({
            title: 'Delete',
            content: 'Are you sure?',
            onOk: this.deleteSelected,
            onCancel() {}
        });
    };

    openPreview = (id) => {
        window.open(`${this.props.url}/preview/${id}`, '', 'width=600,height=600,left=200,top=200')
    }

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
                title: 'Descriptor',
                dataIndex: 'descriptor',
                key: 'descriptor',
                sorter: (a, b) => a.descriptor.localeCompare(b.descriptor, 'en', {'sensitivity': 'base'}),
                sortOrder: sortedInfo.columnKey === 'descriptor' && sortedInfo.order,
                render: (descriptor, record) => (
                    <Button 
                        type={"link"}
                        block={true}
                        style={{
                            height:"auto",
                            whiteSpace:"normal"
                        }} 
                        onClick={()=>{
                            this.quickLookQuestion(record)}
                        }
                    >
                        {descriptor}
                        {/*<Highlighter*/}
                            {/*highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}*/}
                            {/*searchWords={[this.state.searchText]}*/}
                            {/*autoEscape*/}
                            {/*textToHighlight={title}*/}
                        {/*/>*/}
                    </Button>),
                width: "16%",
                ...this.getColumnSearchProps('descriptor')
            },
            {
                title: 'Text',
                dataIndex: 'text',
                key: 'text',
                width: "33%",
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
                title: 'Course',
                key: 'course',
                dataIndex: 'course',
                width: "6%",
                render: course => (
                    <span>
                        <Tag color={RandomColorBySeed(course).bg}>
                            <span style={{color: RandomColorBySeed(course).fg}}>{
                                this.state.courses.find(c => c.id === course) ? this.state.courses.find(c => c.id === course).shortname : undefined
                            }</span>
                        </Tag>
                    </span>
                ),
                filters: [{text: <span style={{color: "red"}}>Only Show Non-course Questions</span>, value: "-1"}].concat(this.state.courses.map(course=> ({text: course.shortname, value: course.id}))),
                filteredValue: this.state.filteredInfo.name,
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
                filteredValue: this.state.filteredInfo.name,
            },
            {
                title: 'Author',
                key: 'owner',
                dataIndex: 'owner',
                render: owner => (
                    <span>{owner}</span>
                )
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
                width: "10%",
                render: (text, record) => (
                    <span>
                        <Link to={`${this.props.url}/edit/${record.id}`}><Button type="link" icon={<EditOutlined />}/></Link>
                        <Divider type="vertical"/>
                        <Button onClick={()=>this.openPreview(record.id)} type="link" icon={<SearchOutlined />}/>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="Delete forever?"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={() => {this.delete(record.id)}}
                        >
                            <DeleteOutlined style={{ color: 'red' }} />
                        </Popconfirm>
                    </span>
                ),
            },
        ];

        return (
            <div className="QuestionTable">
                <Typography.Title level={2}>
                    Question Bank
                </Typography.Title>
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
                <Button.Group>
                    <Link to={`${this.props.url}/new`}><Button icon={<PlusOutlined />} type="primary">New</Button></Link>
                    <Upload
                        beforeUpload={(file, fileList)=>
                            UploadQuestions(file, fileList, this.props.token, ()=>
                                (this.fetch({
                                    owners: [this.props.user],
                                    results: this.state.pagination.defaultPageSize,
                                    page: 1
                                }))
                            )}
                        showUploadList={false} accept=".json">
                        <Button style={{position: "relative", top:2}} icon={<UploadOutlined />} />
                    </Upload>
                </Button.Group>
                <Link to={{pathname: `Quiz/new`, search: "?questions="+this.state.selectedRowKeys.toString()}}><Button icon={<FileOutlined />} type="success" disabled={!hasSelected} style={{margin: "0 0 0 16px"}}>Generate Quiz</Button></Link>
                <Button icon={<DownloadOutlined />} style={{margin: "0 0 0 16px"}} onClick={this.export}>Export {hasSelected && "Selected"}</Button>
                {hasSelected && <Button icon={<DeleteOutlined />} type="danger" style={{float: "right"}} onClick={this.deleteConfirm}>Delete</Button>}
                <Drawer
                    width={640}
                    placement="right"
                    closable={true}
                    mask={false}
                    onClose={this.onClose}
                    visible={this.state.QuickLook.visible}
                    destroyOnClose
                >
                    {this.state.QuickLook.question && <QuickLook question={this.state.QuickLook.question} courses={this.state.courses}/>}
                </Drawer>
            </div>
        );
    }
}
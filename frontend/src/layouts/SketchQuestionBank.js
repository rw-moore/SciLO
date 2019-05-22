import React from "react";
import Highlighter from 'react-highlight-words';
import {Button, Divider, Icon, Layout, Table, Tag, Breadcrumb, Menu, Input} from "antd";
import SideNav from "./SideNav";
import data from "../mocks/QuestionBankTable.js";

export default class SketchQuestionBank extends React.Component {
    state = {
        searchText: '',
        selectedRowKeys: [],

    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
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
        const { Header, Footer, Content } = Layout;


        let filteredInfo = this.state.filteredValue;
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
                ...this.getColumnSearchProps('title')
            },
            {
                title: 'Context',
                dataIndex: 'context',
                key: 'context',
                ...this.getColumnSearchProps('context')
            },
            {
                title: 'Tags',
                key: 'tags',
                dataIndex: 'tags',
                render: tags => (
                    <span>
        {tags.map(tag => {
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
                filters: [{ text: 'easy', value: 'easy' }, { text: 'bonus', value: 'bonus' }],
                filteredValue: filteredInfo.name || null,
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <span>
        <a href="javascript:;">Edit {record.name}</a>
        <Divider type="vertical" />
        <a href="javascript:;">Delete</a>
      </span>
                ),
            },
        ];

        return (
            <Layout style={{minHeight: '100vh'}}>
                <SideNav/>
                <Layout>
                    <Header style={{ background: '#fff', padding: '24px 24px 24px' }} >
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <Icon type="home" />
                            </Breadcrumb.Item>
                            <Breadcrumb.Item href="">
                                <Icon type="database" />
                                <span>Question Bank</span>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Math 101</Breadcrumb.Item>
                        </Breadcrumb>
                    </Header>
                    <Content style={{ margin: '24px 16px 0' }}>
                        <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                            <Table size="middle" rowSelection={rowSelection} columns={columns} dataSource={data} />
                            <Button icon="plus" type="primary">New</Button>
                            <Button icon="file" type="success" disabled={!hasSelected} style={{margin: "0 0 0 16px"}}>Generate Quiz</Button>
                        </div>

                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Concept Sketch</Footer>
                </Layout>
            </Layout>
        )
    }
}
import React from "react";
import {Modal, Table} from "antd";

export default class QuestionStatsCollapse extends React.Component {

    constructor(props) {
        super(props);
    }

    showStats = () => {
        const columns = [
            {
                title: 'Index',
                dataIndex: 'index',
            },
            {
                title: 'Attempts',
                dataIndex: 'tries',
            },
            {
                title: 'Mark',
                dataIndex: 'mark',
            },
        ];
        const data = [
            {
                key: '1',
                index: '1',
                tries: 32,
                mark: 'New York No. 1 Lake Park',
            },
            {
                key: '2',
                index: '2',
                tries: 32,
                mark: 'New York No. 1 Lake Park',
            },
            {
                key: '3',
                index: '3',
                tries: 32,
                mark: 'New York No. 1 Lake Park',
            },
        ];

        Modal.info({
            title: this.props.children,
            content: (
                <div>
                    <Table columns={columns} dataSource={data} size="small" pagination={false}/>
                </div>
            ),
            width: "70%",
            onOk() {},
        });
    }

    render() {
        return(
            <span onClick={this.showStats}>{this.props.children}</span>
        )
    }
}
import React from 'react';
import {Alert, Button, Modal, Table} from "antd";

export default class QuizInfoModal extends React.Component {

    componentDidMount() {

    }

    render() {
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

        if (this.props.quiz.title) {
            return (
                <Modal
                    destroyOnClose
                    title={this.props.quiz.title}
                    visible={this.props.visible}
                    onOk={this.handleOk}
                    onCancel={this.props.onClose}
                    footer={
                        <div>
                            <Button>
                                Start
                            </Button>
                            <Button>
                                Continue my attempt
                            </Button>
                        </div>
                    }
                >
                    <strong>{this.props.quiz.text}</strong>
                    {this.props.attempts.map(attempt => (<Button key={attempt.id}>{attempt.id}</Button>))}
                </Modal>
            )
        }
        else {
            return <></>
        }
    }
}
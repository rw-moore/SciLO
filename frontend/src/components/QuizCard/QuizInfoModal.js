import React from 'react';
import {Alert, Button, Modal, Row, Table} from "antd";

export default class QuizInfoModal extends React.Component {

    componentDidMount() {

    }

    renderAttempts = () => {
        if (this.props.attempts.length > 0) {
            return (this.props.attempts.map(
                attempt => (
                    <Row key={attempt.id} style={{marginBottom: 12}}>
                        <Button style={{minWidth: 128, display: "box"}}>{attempt.id}</Button>
                    </Row>
                )
            ))
        }

        else {
            return <Button>Start new Attempt</Button>
        }


    };

    render() {
        // const columns = [
        //     {
        //         title: 'Index',
        //         dataIndex: 'index',
        //     },
        //     {
        //         title: 'Attempts',
        //         dataIndex: 'tries',
        //     },
        //     {
        //         title: 'Mark',
        //         dataIndex: 'mark',
        //     },
        // ];

        if (this.props.attempts) {
            return (
                <Modal
                    destroyOnClose
                    title={"Select or create a quiz attempt"}
                    visible={this.props.visible}
                    onOk={this.handleOk}
                    onCancel={this.props.onClose}
                    footer={null}
                >
                    <div style={{textAlign: "center"}}>
                        {this.renderAttempts()}
                    </div>
                </Modal>
            )
        }
        else {
           return <></>
        }
    }
}
import React from 'react';
import {Button, Modal} from "antd";

export default class QuizInfoModal extends React.Component {

    componentDidMount() {

    }

    render() {
        return (
            <Modal
                title={this.props.title}
                visible={this.props.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
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
                <strong>Some description of the quiz</strong>
                <p>Some state of the quiz...</p>
                <p>Some state of the quiz...</p>
                <p>Some state of the quiz...</p>
            </Modal>
        )
    }
}
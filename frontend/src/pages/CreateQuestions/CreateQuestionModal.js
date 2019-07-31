import React from "react";
import {Button, Modal, Table} from "antd";
import CreateQuestions from "./index";

export default class CreateQuestionModal extends React.Component {

    onCancel = () => {
        this.props.close();
    };

    render() {
        return (
            <Modal
                className="QuestionModal"
                title={this.props.title}
                visible={this.props.visible}
                width="80%"
                style={{ top: 64 }}
                onCancel={this.onCancel}
                footer={[
                    <Button key="Cancel" type="primary" onClick={this.onCancel}>
                        Cancel
                    </Button>,
                ]}
                destroyOnClose
            >
                <CreateQuestions id={this.props.id} closeModal={this.props.close} token={this.props.token}/>
            </Modal>
        )
    }
}
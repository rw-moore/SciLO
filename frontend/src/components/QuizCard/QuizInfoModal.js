import React from 'react';
import {Alert, Button, message, Modal, Row, Table} from "antd";
import CreateAttemptListByQuiz from "../../networks/CreateAttemptByQuiz";
import {withRouter} from "react-router-dom";

class QuizInfoModal extends React.Component {
    state = {
        loading: false
    };

    componentDidMount() {

    }

    createAttempt = () => {
        this.setState({
            loading: true
        });
        CreateAttemptListByQuiz(this.props.id, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Cannot create quiz attempt, see console for more details.");
                this.setState({
                    loading: false
                })
            } else {
                this.redirectToAttempt(data.data.id)
            }
        });
    };

    redirectToAttempt = (id) => {
        this.props.history.push("Quiz/attempt/"+id)
    };

    renderAttempts = () => {
        if (this.props.attempts.length > 0) {
            return (this.props.attempts.map(
                attempt => (
                    <Row key={attempt.id} style={{marginBottom: 12}}>
                        <Button style={{minWidth: 128, display: "box"}} onClick={()=>{this.redirectToAttempt(attempt.id)}}>{attempt.id}</Button>
                    </Row>
                )
            ))
        }

        else {
            return <Button onClick={this.createAttempt} loading={this.state.loading}>Start new Attempt</Button>
        }


    };

    render() {

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

export default withRouter(QuizInfoModal);
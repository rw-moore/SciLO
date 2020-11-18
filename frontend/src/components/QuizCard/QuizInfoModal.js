import React from 'react';
import {Button, message, Modal, Row} from "antd";
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
        this.props.history.push("/Quiz/attempt/"+id)
    };

    renderAttempts = () => {
        if (this.props.attempts.length > 0) {
            const ordered = this.props.attempts.sort(function(a,b){ 
                if (a.id<b.id) {
                    return -1;
                } else if (a.id>b.id) {
                    return 1;
                }
                return 0;
            });
            return (ordered.map(
                (attempt, index) => (
                    <Row key={attempt.id} style={{marginBottom: 12}}>
                        <Button style={{minWidth: 128, display: "box"}} onClick={()=>{this.redirectToAttempt(attempt.id)}}>Attempt {index+1} - {attempt.user}</Button>
                    </Row>
                )
            ))
        }

        else {
            // return <Button onClick={this.createAttempt} loading={this.state.loading}>Start New Attempt</Button>
            return <></>
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
                        {this.props.create && <Button onClick={this.createAttempt} loading={this.state.loading}>Start New Attempt</Button>}
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
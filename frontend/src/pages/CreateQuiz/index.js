import React from "react";
import {Col, Divider, message, Row} from "antd";
import questions from "../../mocks/Questions";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import BasicFrame from "../../components/QuestionPreviews/BasicFrame";
import FractionDisplay from "../../utils/FractionDisplay";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";

class CreateQuiz extends React.Component {
    state = {};

    componentDidMount() {
        //if (this.props.id) {this.fetch();}
        //this.setState({question: this.props.question});
    }

    fetch = () => {
        //this.setState({ loading: true });
        GetQuestionById(this.props.id).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch question ${this.props.id}, see console for more details.`);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            }
            else {
                let question = data.data.question;
                question.responses.forEach(response => {
                    response.type = JSON.parse(response.type);
                });
                this.setState({question: question})
            }
        });

    };

    render() {

        const colResponsive = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 12
        };

        const divider = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 0
        };

        return (
            <Row gutter={8}>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "89vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>{this.props.id ? "Edit Quiz" : "New Quiz"}</h1>

                    </div>
                </Col>
                <Col {...divider}><div><Divider/></div></Col>
                <Col {...colResponsive} style={{overflowY: "hidden"}}>
                    <div style={{ padding: 22, background: '#fff', height: "89vh", overflowY: "auto", borderStyle: "solid", borderRadius: "4px", borderColor:"#EEE", borderWidth: "2px"}} >
                        <h1>Preview</h1>
                        {/*{this.state.question && <BasicFrame key={this.state.question.title} question={this.state.question}/>}*/}
                        {questions.map(question=>(<span key={question.title} style={{margin: 16}}><BasicFrame question={question}/></span>))}
                    </div>
                </Col>
            </Row>

        )
    }
}

export default withRouter(CreateQuiz);
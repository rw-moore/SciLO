import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Col, Divider, message, Row, Tooltip } from "antd";
import React from "react";
// import FractionDisplay from "../../utils/FractionDisplay";
import { withRouter } from "react-router-dom";
import { clear_ibox_vis } from "../../components/Editor/XmlConverter";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
import API from "../../networks/Endpoints";
import GetQuestionById from "../../networks/GetQuestionById";
import GetQuestionSolutionValues from "../../networks/GetQuestionSolutionValues";
import GetQuestionWithVars from "../../networks/GetQuestionWithVars";

/**
 * page for creating / modifying a question
 */
class CreateQuestions extends React.Component {
    state = {
        preview: true,
        temp_seed: false,
        question: {},
        var_question: {},
        images: [],
        preview_key: 0
    };

    componentDidMount() {
        console.log('mount question')
        if (this.props.id) {this.fetch();}
    }
    componentWillUnmount() {
        console.log('unmount question')
    }

    fetch = (refresh) => {
        GetQuestionById(this.props.id, this.props.token, {substitute:true}).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch question ${this.props.id}, see browser console for more details.`);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            } else {
                if (data.data.error) {
                    message.error(data.data.error);
                }
                let question = data.data.question;
                let var_question = data.data.var_question || question;
                question.question_image = question.question_image.map(file=>({...file, url:API.domain+"/api"+file.url}));
                console.log('fetch', question);
                clear_ibox_vis(question.id);
                this.setState({
                    question: question, 
                    images:question.question_image, 
                    var_question: var_question, 
                    temp_seed: data.data.temp_seed,
                    preview_key: this.state.preview_key+1
                }, ()=>{
                    if (refresh!==undefined) {
                        refresh();
                    }
                });
            }
        });
    };

    fetchWithVariables = () => {
        GetQuestionWithVars(this.state.question, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error(`Error occured while trying to substitute variables, see browser console for more details.`, 7);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                });
            } else {
                if (data.data.error) {
                    message.error(data.data.error);
                }
                let question = data.data.question;
                clear_ibox_vis(question.id);
                this.setState({var_question: question, temp_seed: data.data.temp_seed, preview_key: this.state.preview_key+1});
            }
        })
    }

    fetchWithSolutionVars = (fill) => {
        return GetQuestionSolutionValues({question: this.state.question, filling: fill, seed:this.state.temp_seed}, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error(`Error occured while trying to fill correct answers, see browser console for more details.`, 7);
                console.error("FETCH_FAILED", data);
                this.setState({loading: false});
            } else {
                if (data.data.error) {
                    message.error(data.data.error);
                }
                let vals = data.data.filling;
                return vals;
            }
        })
    }

    updatePreview = (question, images) => {
        this.setState({question: {...this.state.question, ...question}, images:images, temp_seed: false}, ()=> {
            this.fetchWithVariables();
        });
    }

    render() {

        const colResponsive = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: this.state.preview ? 12 : 24
        };

        const divider = {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 0
        };

        const previewIcon = (
            <Tooltip title={this.state.preview ? "hide preview" : "show preview"}>
                {this.state.preview ? 
                    <EyeInvisibleFilled 
                        style={{float: "right"}}
                        onClick={() => {
                            this.setState({preview: !this.state.preview})
                        }}
                    />
                    :
                    <EyeFilled
                        style={{float: "right"}}
                        onClick={() => {
                            this.setState({preview: !this.state.preview})
                        }}
                    />
                }
            </Tooltip>
        );

        return (
            <Row gutter={8}>
                <Col {...colResponsive} style={{overflowY: "hidden", position:"relative", transform:"translateZ(0)"}}>
                    {
                        ((this.props.id && Object.keys(this.state.question).length) || !this.props.id) &&
                            <CreateQuestionForm
                                course={this.props.id ? undefined: this.props.course}
                                question={this.props.id? this.state.question : {}}
                                token={this.props.token}
                                goBack={this.props.closeModal?this.props.closeModal:this.props.history.goBack}
                                fetch = {this.fetch}
                                preview = {this.state.preview}
                                previewIcon = {previewIcon}
                                updatePreview={this.updatePreview}
                                images={this.state.question.question_image}
                            />
                    }
                </Col>
                {this.state.preview && <>
                    <Col {...divider}><div><Divider/></div></Col>
                    <Col {...colResponsive} style={{overflowY: "hidden"}}>
                        <div style={{
                            padding: 22,
                            background: '#fff',
                            height: "89vh",
                            overflowY: "auto",
                            borderStyle: "solid",
                            borderRadius: "4px",
                            borderColor: "#EEE",
                            borderWidth: "2px"
                        }}>
                            <h1>
                                Preview
                                {previewIcon}
                            </h1>
                            {this.state.question &&
                            <OfflineFrame 
                                key={this.state.preview_key} 
                                question={this.state.var_question} 
                                token={this.props.token}
                                loadVars={this.fetchWithVariables}
                                getSolutionValues={this.fetchWithSolutionVars}
                                images={this.state.images}
                                temp_seed={this.state.temp_seed}
                            />}
                        </div>
                    </Col>
                </>}
            </Row>

        )
    }
}

export default withRouter(CreateQuestions);
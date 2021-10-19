import React from "react";
import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Col, Divider, message, Row, Tooltip } from "antd";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import OfflineFrame from "../../components/QuestionPreviews/OfflineFrame";
// import FractionDisplay from "../../utils/FractionDisplay";
import {withRouter} from "react-router-dom";
import GetQuestionById from "../../networks/GetQuestionById";
import GetQuestionWithVars from "../../networks/GetQuestionWithVars";
import API from "../../networks/Endpoints";

/**
 * page for creating / modifying a question
 */
class CreateQuestions extends React.Component {
    state = {
        preview: true,
        loaded_vars: false,
        temp_seed: false,
        question: {},
        images: []
    };

    componentDidMount() {
        console.log('mount question')
        if (this.props.id) {this.fetch();}
    }
    componentWillUnmount() {
        console.log('unmount question')
    }

    fetch = (refresh) => {
        this.setState({ loaded_vars: false });
        GetQuestionById(this.props.id, this.props.token).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch question ${this.props.id}, see browser console for more details.`);
                console.error("FETCH_FAILED", data);
                this.setState({
                    loading: false
                })
            } else {
                let question = data.data.question;
                question.question_image = question.question_image.map(file=>({...file, url:API.domain+":"+API.port+"/api"+file.url}));
                console.log('fetch', question);
                this.setState({question: question, images:question.question_image}, ()=>{
                    if (refresh!==undefined) {
                        refresh();
                    }
                });
            }
        });
        // GetQuestionImages(this.props.id, this.props.token).then(data => {
        //     if (!data || data.status !== 200){
        //         message.error(`Cannot fetch images for question ${this.props.id}, see browser console for more details.`);
        //         console.error("FETCH_FAILED", data);
        //         this.setState({
        //             loading: false
        //         })
        //     } else {
        //         let images = data.data.images;
        //         this.setState({images: images});
        //     }
        // })
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
                let question = data.data.question;
                this.setState({var_question: question, loaded_vars: true, temp_seed: data.data.temp_seed});
            }
        })
    }

    updatePreview = (question, images) => {
        let load_vars = this.state.loaded_vars;
        this.setState({question: {...this.state.question, ...question}, loaded_vars:false, images:images, temp_seed: false}, ()=> {
            if (load_vars) {
                this.fetchWithVariables();
            } 
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
                                key={this.state.question.title} 
                                question={this.state.loaded_vars?this.state.var_question:this.state.question} 
                                token={this.props.token}
                                loadVars={this.fetchWithVariables}
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
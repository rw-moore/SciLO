import React from "react";
import {Button, Card, Checkbox, Divider, Empty, Input, message, Radio, Select, Skeleton, Tag, Tooltip, Typography} from "antd";
import theme from "../../config/theme";
import QuestionStatsCollapse from "./QuestionStatsCollapse";
import SageCell from "../SageCell";
import XmlRender from "../Editor/XmlRender";
import TraceResult from "../DecisionTree/TraceResult";
import TestDecisionTree from "../../networks/TestDecisionTree";

/* Preview Component */
export default class OfflineFrame extends React.Component {
    state = {
        results: undefined,
        loading: false,
        grade: "",
        highestWeight: 0,
        answers: {}
    };

    // save = () => {
    //     message
    //         .loading('Saving..', 2.5)
    //         .then(() => message.success('Saved', 2.5))
    //         .then(() => message.info('This is only a mock for saving', 2.5));
    // };

    // test decision tree
    test = () => {
        if (this.state.loading) {
            return;
        }
        this.setState({
            results: undefined,
            loading: true
        })
        // associate the identifier of each box with its entered value
        let inputs = {};
        let mults = {};
        for (var i=0; i<this.props.question.responses.length;i++){
            inputs[this.props.question.responses[i].identifier] = this.state.answers[this.props.question.responses[i].id] || "None";
            if (this.props.question.responses[i].type.name === "multiple") {
                mults[this.props.question.responses[i].identifier] = this.props.question.responses[i].answers;
            }
        }
        
        const sending = {
            input: inputs,
            mult: mults,
            tree: this.props.question.tree,
            full: false,
            args: {
                script: (this.props.question.variables?this.props.question.variables:undefined),
                offline: true,
                seed: this.props.question.id || 10
            }
        }
        console.log('sending', sending)
        TestDecisionTree(sending, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see browser console for more details.");
                this.setState({loading: false})
                console.error(data);
            }
            else {
                this.setState({
                    results: data.data,
                    loading: false
                })
            }
        });
    }
    
    /* render the question text embedding inputs */
    renderQuestionText = () => {
        const inputChange = (e,o)=>{
            var val = undefined;
            var id = undefined;
            let answers = this.state.answers;
            for (var i=0; i<this.props.question.responses.length; i++) {
                if (this.props.question.responses[i].identifier === ((e.target && e.target.id)||o.key)){
                    id = this.props.question.responses[i].id || i;
                    if (e.target) {
                        val = e.target.value;
                    } else {
                        val = e;
                    }
                }
            }
            if (id !== undefined) {
                answers[id] = val
            }
            this.setState({answers});
        }
        return (
            <div style={{display:"flex"}}>
                <Typography.Text><XmlRender noBorder inline responses={this.props.question.responses} answers={this.state.answers} onChange={inputChange}>{this.props.question.text}</XmlRender></Typography.Text>
            </div>
        )
    }
    /* render the question response by type */
    renderComponents = () => {
        if (this.props.question.responses) {
            return this.props.question.responses.map((component,id) => {
                if (component.id === undefined) {
                    component.id = id;
                }
                switch (component.type.name) {
                    case "multiple":
                        if (component.type.dropdown) {
                            let pattern = "<dbox[\\w \"=]*id=\""+component.identifier+"\"[\\w /=\"]*>"
                            let reg = new RegExp(pattern, 'g');
                            if (this.props.question.text && this.props.question.text.match(reg)) {
                                return <React.Fragment key={id} />
                            }
                            return this.renderDropDown(component, id);
                        }
                        else {
                            return this.renderMultiple(component, id);
                        }
                    case "sagecell":
                        return this.renderSageCell(component, id);
                    case "tree":
                        let pattern = "<ibox[\\w \"=]*id=\""+component.identifier+"\"[\\w /=\"]*>"
                        let reg = new RegExp(pattern, 'g');
                        if (this.props.question.text && this.props.question.text.match(reg)) {
                            return <React.Fragment key={id} />
                        }
                        return this.renderInput(component, id);
                    default:
                        return <span>Error Response</span>
                }
            })
        }
        else return <Empty/>
    };

    /* render the input type response */
    renderInput = (c, id) => {
        let tip = ''
        if (c.patternfeedback) {
            tip = c.patternfeedback;
        } else {
            if (c.patterntype !== "Custom") {
                tip = "Your answer should be a"
                if (/^[aeiou].*/i.test(c.patterntype)) {
                    tip +=  'n'
                }
                tip += ' '+c.patterntype
            } else {
                tip = "Your answer does not meet the format of the question"
            }
        }
        let pop_reg = new RegExp(c.pattern, c.patternflag);
        let pop_test = !this.state.answers[c.id] || (pop_reg.test(this.state.answers[c.id]) || this.state.answers[c.id]==='');
        let embed_reg = new RegExp("<ibox[\\w \"=]*id=\""+c.identifier+"\"[\\w /=\"]*>", "g");
        if (embed_reg.test(c.text)) {
            if (embed_reg.test(this.props.question.text, "g")) {
                message.error("Ibox "+c.identifier+" is already embedded in the question text.");
            } else {
                const inputChange = (e)=>{
                    let answers = this.state.answers;
                    answers[c.id] = e.target.value;
                    this.setState({answers});
                }
                return (
                    <div key={id} style={{margin:8}}>
                        <XmlRender noBorder inline responses={this.props.question.responses} answers={this.state.answers} onChange={inputChange}>{c.text}</XmlRender>
                    </div>
                )
            }
        }
        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <div style={{margin: 4}}>
                    <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
                </div>
                <Tooltip
                    id={c.identifier+'_tooltip'}
                    title={tip}
                    visible={!pop_test}
                >
                    <Input
                        addonBefore={c.type.label}
                        value={this.state.answers[c.id]}
                        onChange={
                            (e)=> {
                                let answers = this.state.answers;
                                answers[c.id] = e.target.value;
                                this.setState({answers});
                            }
                        }
                    />
                </Tooltip>
            </div>
        )
    };

    /* render the multiple-dropdown type response */
    renderDropDown = (c, id) => {
        let dropdown;
        const Option = Select.Option;

        dropdown = <Select
            mode={c.type.single?"default":"multiple"}
            style={{width:"100%"}}
            onChange={
                (e)=> {
                    let answers = this.state.answers;
                    answers[c.id] = e;
                    this.setState({answers});
                }
            }
        >
            {
                c.answers && // answers may be undefined
                c.answers.map((r,index)=>(
                    <Option key={index} value={r.text}>
                        <XmlRender style={{border: undefined}}>{r.text}</XmlRender>
                    </Option>
                ))
            }
        </Select>;

        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <div style={{margin: 4}}>
                    <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
                </div>
                {dropdown}
            </div>
        )
    };

    /* render the multiple-normal type response */
    renderMultiple = (c, id) => {
        let choices;

        const RadioGroup = Radio.Group;
        const CheckboxGroup = Checkbox.Group;

        const optionStyle = {
            display: 'block',
            lineHeight: '30px',
        };

        // only one correct answer
        if (c.type.single) {
            choices = (
                <RadioGroup
                    onChange={
                        (e) => {
                            let answers = this.state.answers;
                            answers[c.id] = e.target.value;
                            this.setState({answers});
                        }
                    }
                    value={this.state.answers[c.id]}
                >
                    {
                        c.answers && // answer could be undefined
                        c.answers.map((r, index)=>(
                            <Radio key={index} value={r.text} style={optionStyle}>
                                <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>
                            </Radio>
                        ))
                    }
                </RadioGroup>
            );
        }
        // multiple selection
        else {
            choices = (
                <div className="verticalCheckBoxGroup">
                    <CheckboxGroup
                        onChange={
                            (e) => {
                                let answers = this.state.answers;
                                answers[c.id] = e;
                                this.setState({answers});
                            }
                        }
                    >
                        {c.answers && c.answers.map((r,index)=>(
                                <Checkbox value={r.text} key={index} >
                                    <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>
                                </Checkbox>
                            ))
                        }
                    </CheckboxGroup>
                </div>
            );
        }

        return (
            <div key={id} style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}>
                <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
                {choices}
            </div>
        )
    };

    /* render the input type response */
    renderSageCell = (c, id) => {

        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <div style={{margin: 4}}>
                    <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
                </div>
                <SageCell src={c.type.src} language={c.type.language} params={c.type.params} script={c.type.code}/>
            </div>
        )
    };

    render() {

        return (
            <div>
                <Card
                    type={"inner"}
                    title={
                        <QuestionStatsCollapse question={this.props.question}>
                            <Typography.Title level={4}>{this.props.question.title}</Typography.Title>
                        </QuestionStatsCollapse>
                    }
                    extra={
                        <span>
                            {`${this.state.results?this.state.results.score:0} / ${this.props.question.mark||0}`}
                        </span>}
                >
                    {this.props.question && this.renderQuestionText()}
                    {this.props.question.responses && this.props.question.responses.length > 0 && <>
                        <Divider style={{marginTop: "12px", marginBottom: "12px"}}/>
                        {this.renderComponents()}
                        <Skeleton loading={this.state.loading} active>
                            {(!!this.state.results) && <div>
                                <Divider orientation={"left"}>Result</Divider>
                                Your score: <Tag color={"orange"}>{this.state.results.score}</Tag>
                                <br/>
                                Your feedback: {this.state.results.feedback.map((f,i)=><Tag key={i} color={"cyan"}>{f}</Tag>)}
                                <br/>
                                Your Trace:
                                <br/>
                                <TraceResult data={this.state.results.trace}/>
                                Timing:
                                <blockquote>{this.state.results.time}</blockquote>
                            </div>
                            }
                        </Skeleton>
                        <Divider/>
                        <Button icon="upload" onClick={this.test}>Test</Button>
                        <Button icon="download" onClick={this.props.loadVars}>Load Variables</Button>
                    </>
                    }
                </Card>
            </div>
        )
    }
}
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

    // render question's tags
    renderTags = () => {
        return this.props.question.tags.map(tag => (<Tag color={theme["@primary-color"]}>{tag.name}</Tag>))
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
        this.setState({results: undefined})
        this.setState({loading: true})
        // associate the identifier of each box with its entered value
        let inputs = {};
        let mults = {};
        Object.keys(this.state.answers).forEach(id=>{
            if (this.props.question.responses[id]) {
                inputs[this.props.question.responses[id].identifier] = this.state.answers[id];
                if (this.props.question.responses[id].type.name === "multiple") {
                    mults[this.props.question.responses[id].identifier] = this.props.question.responses[id].answers
                }
            }
        });
        for (var i=0; i<this.props.question.responses.length; i++) {
            if (!(this.props.question.responses[i].identifier in inputs)) {
                inputs[this.props.question.responses[i].identifier] = "None";
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

        TestDecisionTree(sending, this.props.token).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see console for more details.");
                this.setState({loading: false})
                console.error(data);
            }
            else {
                this.setState({results: data.data})
                this.setState({loading: false})
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
                    id = i;
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
                <Typography.Text><XmlRender noBorder inline question={this.props.question.responses} answers={this.state.answers} onChange={inputChange}>{this.props.question.text}</XmlRender></Typography.Text>
            </div>
        )
    }
    /* render the question response by type */
    renderComponents = () => {
        if (this.props.question.responses) {
            return this.props.question.responses.map((component,id) => {
                if (!component.id) {
                    component.id = id;
                }
                switch (component.type.name) {
                    case "multiple":
                        if (component.type.dropdown) {
                            let pattern = "<dbox[\\w \"=]*id=\""+component.identifier+"\"[\\w /=\"]*>"
                            let reg = new RegExp(pattern, 'g');
                            if (this.props.question.text && this.props.question.text.match(reg)) {
                                return <></>
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
                            return <></>
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
        let reg = new RegExp(c.pattern, c.patternflag);
        let test = !this.state.answers[id] || (reg.test(this.state.answers[id]) || this.state.answers[id]==='');
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
                    visible={!test}
                >
                    <Input
                        addonBefore={c.type.label}
                        value={this.state.answers[id]}
                        onChange={
                            (e)=> {
                                let answers = this.state.answers;
                                answers[id] = e.target.value;
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
                    answers[id] = e;
                    this.setState({answers});
                }
            }
        >
            {
                c.answers && // answers may be undefined
                c.answers.map(r=><Option key={r.text} value={r.text}><XmlRender style={{border: undefined}}>{r.text}</XmlRender></Option>)
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
                            answers[id] = e.target.value;
                            this.setState({answers});
                        }
                    }
                    value={this.state.answers[id]}
                >
                    {
                        c.answers && // answer could be undefined
                        c.answers.map(r=><Radio key={r.text} value={r.text} style={optionStyle}><XmlRender inline style={{border: undefined}}>{r.text}</XmlRender></Radio>)
                    }
                </RadioGroup>
            );
        }
        // multiple selection
        else {
            choices =
            <div className="verticalCheckBoxGroup">
                <CheckboxGroup
                options={
                    c.answers &&
                    c.answers.map(r=>({label: <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>, value: r.text}))
                }
                onChange={
                    (e) => {
                        let answers = this.state.answers;
                        answers[id] = e;
                        this.setState({answers});
                    }
                }
            />
            </div>
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

        let Sum = 0;
        if (this.props.question.responses) {
            this.props.question.responses.forEach(c=> {
                if (c.mark) {
                    Sum += c.mark
                }
            });
        }

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
                            {`${this.props.question.grade?this.props.question.grade:0} / ${Sum}`}
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
                    </>
                    }
                </Card>
            </div>
        )
    }
}
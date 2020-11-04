import React from "react";
import {Button, Card, Checkbox, Divider, Empty, Input, message, Radio, Select, Skeleton, Tag, Typography} from "antd";
import theme from "../../config/theme";
import QuestionStatsCollapse from "./QuestionStatsCollapse";
import SageCell from "../SageCell";
import XmlRender from "../Editor/XmlRender";
import DecisionTreeFrame from "./DecisionTreeFrame";
import {UserConsumer} from "../../contexts/UserContext";
import TraceResult from "../DecisionTree/TraceResult";
import TestDecisionTree from "../../networks/TestDecisionTree";

/* Preview Component */
export default class OfflineFrame extends React.Component {
    xml = true;
    state = {
        results: undefined,
        value: undefined,
        loading: false,
        marked: false,
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
        Object.keys(this.state.answers).forEach(id=>{
            if (this.props.question.responses[id-1]) {
                inputs[this.props.question.responses[id-1].identifier] = this.state.answers[id];
            }
        });
        console.log('inputs: ',inputs);
        const sending = {
            input: inputs,
            tree: this.props.question.tree,
            full: false,
            args: {
                script: (this.props.question.variables?this.props.question.variables:undefined)
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
                console.log(data.data)
            }
        });
    }

    // calculate the mark of the response
    calculateMark = (id, response) => {
        let mark = 0;
        const answer = this.state.answers[id];

        if (!response) {
            return mark;
        }

        response.forEach(r=>{
            if (answer&&Array.isArray(answer)) {
                answer.forEach(a=>{
                    if (r.text === a) {
                        mark += r.grade;
                    }
                })
            }
            else {
                if (r.text === answer) {
                    mark = r.grade;
                }
            }
        });
        return mark;
    };
    
    /* render the question text embedding inputs */
    renderQuestionText = () => {
        if (this.xml) {
            const inputChange = (e,o)=>{
                var val;
                var id;
                let answers = this.state.answers;
                if (e.target) {
                    var resp = this.props.question.responses.find(resp=>resp.identifier==e.target.id);
                    id=this.props.question.responses.indexOf(resp)+1;
                    if (resp.pattern){
                        var reg = new RegExp(resp.pattern,resp.patternflag);
                        // for RegExp.test with the global flag every second call is guaranteed to return false
                        // so if you want to check the output uncomment both lines
                        // console.log(reg.test(e.target.value));
                        // reg.test(e.target.value);
                        if (reg.test(e.target.value)){
                            console.log('match');
                            val = e.target.value;
                        } else {
                            console.log('no match');
                        }
                    }
                } else {
                    var resp = this.props.question.responses.find(resp=>resp.identifier==o.key);
                    id=this.props.question.responses.indexOf(resp)+1;
                    val = e;
                }
                answers[id] = val
                console.log(answers)
                this.setState({answers});
            }
            return (
                <div style={{display:"flex"}}>
                    <Typography.Text><XmlRender noBorder inline question={this.props.question.responses} onChange={inputChange}>{this.props.question.text}</XmlRender></Typography.Text>
                </div>
            )
        } else {
            let text = [this.props.question.text];
            this.props.question.responses && this.props.question.responses.forEach(resp => {
                // match [[_iden]] with any amount of whitespace between the inner []
                var repl = new RegExp("\\[\\[\\s*"+resp.identifier+"\\s*]]",'g');
                // catch all embedded boxes
                var clean = false;
                while (!clean) {
                    clean = true;
                    for (var i=0; i<text.length; i++){
                        if (typeof(text[i])=="string" && text[i].match(repl)){
                            var match = text[i].match(repl)[0];
                            clean = false;
                            //replace a string with an embedded box with
                            // the string before the box
                            // the box object
                            // the string after the box
                            var before = text[i].substring(0,text[i].indexOf(match));
                            var after = text[i].substring(text[i].indexOf(match)+match.length);
                            text.splice(i,1,before,resp,after);
                            break;
                        }
                    }
                }
            })
            // flex so that the string stays in 1 line
            return (
                <div style={{display:"flex"}}>
                    {this.props.question.text && text.map((t,i)=>{
                        if (typeof(t)=="string"){
                            return <Typography.Text key={i}><XmlRender noBorder>{t}</XmlRender></Typography.Text>
                        } else if (t.type && t.type.name === "tree") {
                            var id = this.props.question.responses.indexOf(t)+1;
                            return (
                                <div
                                    key={i}
                                    style={{width:75,paddingInline:"8px"}}
                                >
                                    <Input
                                        size="small"
                                        value={this.state.answers[id]}
                                        disabled={this.state.marked}
                                        onChange={
                                            (e)=> {
                                                let answers = this.state.answers;
                                                answers[id] = e.target.value;
                                                this.setState({answers});
                                            }
                                        }
                                    />
                                </div>
                            )
                        } else {
                            return <></>
                        }
                    })}
                </div>)
        }
    }
    /* render the question response by type */
    renderComponents = () => {
        if (this.props.question.responses) {
            return this.props.question.responses.map((component,id) => {
                // if (!this.xml){
                //     pattern = "\\[\\[\\s*"+component.identifier+"\\s*]]"
                // }
                switch (component.type.name) {
                    case "multiple":
                        if (component.type.dropdown) {
                            var pattern = "<dbox[\\w \"=]*id=\""+component.identifier+"\"[\\w \/=\"]*>"
                            var reg = new RegExp(pattern, 'g');
                            if (this.props.question.text && this.props.question.text.match(reg)) {
                                return <></>
                            }
                            return this.renderDropDown(component, id+1);
                        }
                        else {
                            return this.renderMultiple(component, id+1);
                        }
                    case "sagecell":
                        return this.renderSageCell(component, id+1);
                    case "tree":
                        var pattern = "<ibox[\\w \"=]*id=\""+component.identifier+"\"[\\w \/=\"]*>"
                        var reg = new RegExp(pattern, 'g');
                        if (this.props.question.text && this.props.question.text.match(reg)) {
                            return <></>
                        }
                        return this.renderInput(component, id+1);
                    default:
                        return <span>Error Response</span>
                }
                return <></>
            })
        }
        else return <Empty/>
    };

    /* render the input type response */
    renderInput = (c, id) => {
        console.log('input')
        let renderMark;
        const mark = this.calculateMark(id, c.answers);
        // render the mark only when marked
        renderMark = this.state.marked ? <span style={{color: "red"}} >{mark}</span> : undefined;

        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <div style={{margin: 4}}>
                    <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
                </div>
                <Input
                    addonBefore={c.type.label}
                    value={this.state.answers[id]}
                    disabled={this.state.marked}
                    addonAfter={renderMark}
                    onChange={
                        (e)=> {
                            let answers = this.state.answers;
                            answers[id] = e.target.value;
                            this.setState({answers});
                        }
                    }
                />
            </div>
        )
    };

    /* render the multiple-dropdown type response */
    renderDropDown = (c, id) => {
        let renderMark;
        const mark = this.calculateMark(id, c.answers);
        // render the mark only when marked
        renderMark = this.state.marked ? <span style={{color: "red"}} >{mark}</span> : undefined;

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
            disabled={this.state.marked}
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
                {renderMark}
            </div>
        )
    };

    /* render the multiple-normal type response */
    renderMultiple = (c, id) => {

        let renderMark;
        let choices;
        const mark = this.calculateMark(id, c.answers);
        renderMark = this.state.marked ? <span style={{color: "red"}} >{mark}</span> : undefined;

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
                    disabled={this.state.marked}
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
                disabled={this.state.marked}
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
                {renderMark}
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
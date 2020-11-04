import React from "react";
import {Button, Card, Checkbox, Divider, Empty, Form, Input, Radio, Select, Tag, Tooltip, Typography} from "antd";
import theme from "../../config/theme";
import QuestionStatsCollapse from "./QuestionStatsCollapse";
import SageCell from "../SageCell";
import XmlRender from "../Editor/XmlRender";

const FormItem = Form.Item;

/* Answer Question Component */
export default class QuestionFrame extends React.Component {

    state = {
        answers: {},
    };

    componentDidMount() {
        this.loadAnswer();
    }

    // load pre-answer into components
    loadAnswer = () => {
        let newAnswers = this.state.answers;
        this.props.question.responses.forEach(response => {
            let answer;
            for ( const index in response.tries) {
                // reach not used try
                if (response.tries[index][0] === null) {
                    break
                }

                // already correct answer MAY CAUSE PROBLEM grade > 0
                if (response.tries[index][2] && response.tries[index][1]) {
                    answer = response.tries[index][0];
                    break
                }

                answer = response.tries[index][0];

            }
            if (answer) {newAnswers[response.id] = answer;}
        });
        this.setState({answers: newAnswers});
    };

    // render question's tags
    renderTags = () => {
        return this.props.question.tags.map(tag => (<Tag color={theme["@primary-color"]}>{tag.name}</Tag>))
    };

    getStatus = (left, max,  correct) => {
        if (max === left) return undefined;
        else if (correct) return "success";
        else if (left > 0 && !correct) return "warning";
        else if (left === 0) return "error";
    };

    getBorder = (left, max,  correct) => {
        if (max === left) return theme["@white"];
        else if (correct) return "#45ae41";
        else if (left > 0 && !correct) return "#c39019";
        else if (left === 0) return "#e1211f";
    };

    getScore = (tries) => {
        let score;
        for (const index in tries) {
            if (tries[index][0] !== null) {
                score =  tries[index][1]
            }
            else return score;
        }
        return score
    };

    // NEED FIX MARK IS WRONG
    renderResponseTextLine = (c, color) => (
        <div style={{marginTop: 6, marginBottom: 16}}>
            <XmlRender style={{border: undefined}}>{c.text}</XmlRender>
            <span style={{float: "right", color: color}}>
                <span>
                    {(!!c.grade_policy.penalty_per_try && (c.grade_policy.max_tries - c.left_tries > 1 || !(c.tries.filter((attempt)=>attempt[2] === true).length > 0))) &&
                        <span>
                            Penalty:
                            {    ((c.grade_policy.free_tries - c.grade_policy.max_tries + c.left_tries >= 0)  && c.grade_policy.free_tries) ?
                                 <Tooltip title={"Free Tries: "+c.grade_policy.free_tries}>
                                     <span style={{textDecoration: (c.grade_policy.max_tries - c.left_tries <= c.grade_policy.free_tries)? "line-through" : undefined}}>
                                         {c.grade_policy.penalty_per_try} %
                                     </span>
                                 </Tooltip>
                                 :
                                 <span>{c.grade_policy.penalty_per_try * (c.grade_policy.max_tries - (c.left_tries ? c.left_tries : 1) - c.grade_policy.free_tries )} %</span>
                            }
                            <Divider type={"vertical"}/>
                        </span>
                    }
                    {(!!c.left_tries && (c.grade_policy.max_tries - c.left_tries > 1 || !(c.tries.filter((attempt)=>attempt[2] === true).length > 0))) &&
                        <span>
                            Tries Left: {c.left_tries}
                            <Divider type={"vertical"}/>
                        </span>
                    }

                </span>
                <Tag
                    color={color}
                >
                    {this.getScore(c.tries)}
                </Tag>
            </span>
        </div>
    );

    getFeedback = (c) => {
        const temp = c.tries.filter((item)=>item[0]!=null);
        if (temp.length > 0) {
            const item = temp.pop()[3];
            return item && item.join("\n");
        }
    }

    /* render the question text embedding inputs */
    renderQuestionText = () => {
        let text = [this.props.question.text];
        this.props.question.responses.forEach(resp => {
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
                {text.map((t,i)=>{
                    if (typeof(t)=="string"){
                        return <Typography.Text key={i}><XmlRender noBorder>{t}</XmlRender></Typography.Text>
                    } else if (t.type && t.type.name === "tree") {
                        var id = this.props.question.responses.indexOf(t)+1;
                        const color = this.getBorder(t.left_tries, t.grade_policy.max_tries, t.tries.filter((attempt)=>attempt[2] === true).length > 0);
                        return (
                            <div
                                key={i}
                                style={{width:75,paddingInline:"8px",backgroundColor: theme["@white"],
                                border:"1px solid", borderColor: color}}
                            >
                                <Input
                                    size="small"
                                    value={this.state.answers[id]}
                                    disabled={t.left_tries === 0 || t.tries.filter((attempt)=>attempt[2] === true).length > 0}
                                    onChange={
                                        (e)=> {
                                            let answers = this.state.answers;
                                            answers[id] = e.target.value;
                                            this.setState({answers});
                                            this.props.buffer(t.id, e.target.value);
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
    /* render the question response by type */
    renderComponents = () => {
        let tempId = 0;
        if (this.props.question.responses) {
            return this.props.question.responses.map(component => {

                // possibly unreachable condition
                if (component.id === undefined) {
                    component.id = "_temp_" + tempId;
                    tempId++;
                }

                if (!component.tries) {
                    component.tries = []
                }
                var repl = new RegExp("\\[\\[\\s*"+component.identifier+"\\s*]]",'g');
                if (!this.props.question.text.match(repl)){
                    switch (component.type.name) {
                        case "input":
                            return this.renderInput(component, component.id);
                        case "multiple":
                            if (component.type.dropdown) {
                                return this.renderDropDown(component, component.id);
                            }
                            else {
                                return this.renderMultiple(component, component.id);
                            }
                        case "sagecell":
                            return this.renderSagecell(component, component.id);
                        case "tree":
                            return this.renderInput(component, component.id);
                        default:
                            return <span>Error Response</span>
                    }
                }
            })
        }
        else return <Empty/>
    };

    /* render the input type response */
    renderInput = (c, id) => {
        const color = this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);

        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px solid",
                    borderColor: color
                }}
            >
                {this.renderResponseTextLine(c, color)}
                <FormItem
                    hasFeedback
                    validateStatus={this.getStatus(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0)}
                    help={this.getFeedback(c)}
                >
                    <Input
                        addonBefore={c.type.label}
                        value={this.state.answers[id]}
                        disabled={c.left_tries === 0 || c.tries.filter((attempt)=>attempt[2] === true).length > 0}
                        onChange={
                            (e)=> {
                                let answers = this.state.answers;
                                answers[id] = e.target.value;
                                this.setState({answers});
                                this.props.buffer(c.id, e.target.value);
                            }
                        }
                    />
                </FormItem>
            </div>
        )
    };
    /* render the multiple-dropdown type response */
    renderDropDown = (c, id) => {
        let dropdown;
        const Option = Select.Option;

        const color = this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);

        dropdown = <Select
            mode={c.type.single?"default":"multiple"}
            style={{width:"100%"}}
            value={this.state.answers[id]}
            onChange={
                (e)=> {
                    let answers = this.state.answers;
                    answers[id] = e;
                    this.setState({answers});
                    this.props.buffer(c.id, e);
                }
            }
            disabled={c.left_tries === 0 || c.tries.filter((attempt)=>attempt[2] === true).length > 0}
        >
            {
                c.choices && // answers may be undefined
                c.choices.map(r=><Option key={r.id} value={r.id}><XmlRender style={{border: undefined}}>{r.text}</XmlRender></Option>)
            }
        </Select>;

        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px solid",
                    borderColor: color
                }}
            >
                {this.renderResponseTextLine(c, color)}
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

        const color = this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);

        const uncheck = (r) => {
            let answers = this.state.answers;
            if (answers[id] === r) {
                delete answers[id];
                this.setState({answers});
                this.props.buffer(c.id, undefined);
            }
        };

        // only one correct answer
        if (c.type.single) {
            choices = (
                <FormItem
                    //hasFeedback
                    validateStatus={this.getStatus(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0)}
                    help={this.getFeedback(c)}
                >
                <RadioGroup
                    onChange={
                        (e) => {
                            let answers = this.state.answers;
                            answers[id] = e.target.value;
                            this.setState({answers});
                            this.props.buffer(c.id, e.target.value);
                        }
                    }
                    value={this.state.answers[id]}
                    disabled={c.left_tries === 0 || c.tries.filter((attempt)=>attempt[2] === true).length > 0}
                >
                    {
                        c.choices && // answer could be undefined
                        c.choices.map(r=><Radio key={r.id} value={r.id} style={optionStyle} onClick={()=>{uncheck(r.id)}}>{<XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>}</Radio>)
                    }
                </RadioGroup>
                </FormItem>
            );
        }
        // multiple selection
        else {
            choices =
                <div className="verticalCheckBoxGroup">
                    <FormItem
                        //hasFeedback
                        validateStatus={this.getStatus(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0)}
                        help={this.getFeedback(c)}
                    >
                    <CheckboxGroup
                        options={
                            c.choices &&
                            c.choices.map(r=>({label: <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>, value: r.id}))
                        }
                        value={this.state.answers[id]}
                        disabled={c.left_tries === 0 || c.tries.filter((attempt)=>attempt[2] === true).length > 0}
                        onChange={
                            (e) => {
                                let answers = this.state.answers;
                                answers[id] = e;
                                this.setState({answers});
                                this.props.buffer(c.id, e);
                            }
                        }
                    />
                    </FormItem>
                </div>
        }

        return (
            <div key={id}
                 style={{
                     backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px solid",
                     borderColor: color
                 }}
            >
                {this.renderResponseTextLine(c, color)}
                {choices}
            </div>
        )
    };

    renderSagecell = (c, id) => {
        const color = theme["@white"];
        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px solid",
                    borderColor: color
                }}
            >
                {this.renderResponseTextLine(c, color)}
                <FormItem
                    //help="Be sure to run the codes first to save / submit it!"
                >
                    <SageCell
                    onChange={(cellInfo) => {this.props.buffer(c.id, cellInfo)}}
                    src={c.type.src}
                    language={c.type.language}
                    params={c.type.params}
                >
                        {this.state.answers[id] ? this.state.answers[id] : c.type.code}
                    </SageCell>
                </FormItem>
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
                            <Typography.Title level={4}>{`${(this.props.index+1)}. ${this.props.question.title}`}</Typography.Title>
                        </QuestionStatsCollapse>
                    }
                    extra={
                        <span>
                            {`${this.props.question.grade?this.props.question.grade:0} / ${this.props.question.mark}`}
                        </span>}
                >
                    {this.renderQuestionText()}
                    {this.props.question.responses && this.props.question.responses.length > 0 && <>
                        <Divider style={{marginTop: "12px", marginBottom: "12px"}}/>
                        {this.renderComponents()}
                        <Divider/>
                        <Button type="primary" ghost icon="save" onClick={this.props.save} loading={this.props.loading}>Save</Button>
                        <Button type="danger" icon="upload" onClick={this.props.submit} style={{float: "right"}} loading={this.props.loading}>Submit</Button>
                    </>}
                </Card>
            </div>
        )
    }
}
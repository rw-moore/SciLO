import React from "react";
import {Button, Card, Checkbox, Col, Divider, Empty, Form, Input, Radio, Row, Select, Tag, Tooltip, Typography} from "antd";
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
        for (const index in this.props.question.tries) {
            // if there were no answers
            if (this.props.question.tries[index][0] === null) {
                break;
            }
            // load the array with the correct values
            this.props.question.responses.forEach(response => {
                newAnswers[response.id] = this.props.question.tries[index][0][response.identifier]
            })
            // newAnswers = this.props.question.tries[index][0];
            // if they got full marks
            if (this.props.question.tries[index][2] && this.props.question.tries[index][1]) {
                break;
            }
        }
        // this.props.question.responses.forEach(response => {
        //     let answer;
        //     for ( const index in response.tries) {
        //         // reach not used try
        //         if (response.tries[index][0] === null) {
        //             break
        //         }

        //         // already correct answer MAY CAUSE PROBLEM grade > 0
        //         if (response.tries[index][2] && response.tries[index][1]) {
        //             answer = response.tries[index][0];
        //             break
        //         }

        //         answer = response.tries[index][0];

        //     }
        //     if (answer) {newAnswers[response.id] = answer;}
        // });
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

    getBorder = () => {
        //this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);
        // let noSub = true;
        // let noLeft = 0;
        if (this.props.question.tries[0][0]===null) {
            return theme["@white"]
        }
        if (this.props.question.grade >= 100){
            return "#45ae41"
        }
        if (this.props.question.left_tries === 0){
            return "#e1211f"
        }
        return "#c39019"
        // this.props.question.responses.forEach(resp => {
        //     if (resp.left_tries !== resp.grade_policy.max_tries){
        //         noSub = false;
        //     }
        //     if (resp.left_tries === 0){
        //         noLeft++;
        //     }
        // })
        // if (noSub) return theme["@white"];
        // else if ((this.props.question.grade/(this.props.question.mark||0)) >= 1) return "#45ae41";
        // else if (noLeft !== this.props.question.responses.length) return "#c39019";
        // else return "#e1211f";
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
        </div>
    );

    getFeedback = () => {
        return (this.props.question.feedback || []).map((f,i)=><Tag key={i} color={"cyan"}>{f}</Tag>)
    }

    /* render the question text embedding inputs */
    renderQuestionText = () => {
        const inputChange = (e,o)=>{
            var val = undefined;
            var id = undefined;
            let answers = this.state.answers;
            for (var i=0; i<this.props.question.responses.length; i++) {
                if (this.props.question.responses[i].identifier === ((e.target && e.target.id)||o.key)){
                    id = this.props.question.responses[i].id;
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
            this.props.buffer(id, val);
        }
        const disable = this.props.question.left_tries === 0 || this.props.question.tries.filter((attempt)=>attempt[2] === true).length > 0 || this.props.closed;
        return (
            <div style={{display:"flex"}}>
                <Typography.Text><XmlRender noBorder inline responses={this.props.question.responses} disable={disable} answers={this.state.answers} onChange={inputChange}>{this.props.question.text}</XmlRender></Typography.Text>
            </div>
        )
    }
    /* render the question response by type */
    renderComponents = () => {
        if (this.props.question.responses) {
            return this.props.question.responses.map((component,id) => {
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
        let reg = new RegExp(c.pattern, c.patternflag);
        let test = !this.state.answers[c.id] || (reg.test(this.state.answers[c.id]) || this.state.answers[c.id]==='');
        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"
                }}
            >
                {this.renderResponseTextLine(c)}
                <Tooltip
                    visible={!test}
                    title={tip}
                >
                    <Input
                        addonBefore={c.type.label}
                        value={this.state.answers[c.id]}
                        disabled={this.props.question.left_tries === 0 || this.props.question.tries.filter((attempt)=>attempt[2] === true).length > 0 || this.props.closed}
                        onChange={
                            (e)=> {
                                let answers = this.state.answers;
                                answers[c.id] = e.target.value;
                                this.setState({answers});
                                this.props.buffer(c.id, e.target.value);
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
            value={this.state.answers[c.id]}
            onChange={
                (e)=> {
                    let answers = this.state.answers;
                    answers[c.id] = e;
                    console.log(e);
                    this.setState({answers});
                    this.props.buffer(c.id, e);
                }
            }
            disabled={this.props.question.left_tries === 0 || this.props.question.tries.filter((attempt)=>attempt[2] === true).length > 0 || this.props.closed}
        >
            {
                c.choices && // answers may be undefined
                c.choices.map(r=>(
                    <Option key={r.id} value={r.id}>
                        <XmlRender style={{border: undefined}}>{r.text}</XmlRender>
                    </Option>
                ))
            }
        </Select>;

        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"
                }}
            >
                {this.renderResponseTextLine(c)}
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

        const uncheck = (r) => {
            let answers = this.state.answers;
            if (answers[c.id] === r) {
                delete answers[c.id];
                this.setState({answers});
                this.props.buffer(c.id, undefined);
            }
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
                            this.props.buffer(c.id, e.target.value);
                        }
                    }
                    value={this.state.answers[c.id]}
                    disabled={this.props.question.left_tries === 0 || this.props.question.tries.filter((attempt)=>attempt[2] === true).length > 0 || this.props.closed}
                >
                    {
                        c.choices && // answer could be undefined
                        c.choices.map(r=>(
                            <Radio key={r.id} value={r.id} style={optionStyle} onClick={()=>{uncheck(r.id)}}>
                                <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>
                            </Radio>
                        ))
                    }
                </RadioGroup>
            );
        }
        // multiple selection
        else {
            choices =
                <div className="verticalCheckBoxGroup">
                    <CheckboxGroup
                        value={this.state.answers[c.id]}
                        disabled={this.props.question.left_tries === 0 || this.props.question.tries.filter((attempt)=>attempt[2] === true).length > 0 || this.props.closed}
                        onChange={
                            (e) => {
                                let answers = this.state.answers;
                                answers[c.id] = e;
                                console.log(e)
                                this.setState({answers});
                                this.props.buffer(c.id, e);
                            }
                        }
                    >
                        {c.choices &&c.choices.map((r,index)=>(
                                <Checkbox value={r.id} key={index}>
                                    <XmlRender inline style={{border: undefined}}>{r.text}</XmlRender>
                                </Checkbox>
                            ))
                        }
                    </CheckboxGroup>
                </div>
        }

        return (
            <div key={id} style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}>
                {this.renderResponseTextLine(c)}
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
                        {this.state.answers[c.id] ? this.state.answers[c.id] : c.type.code}
                    </SageCell>
                </FormItem>
            </div>
        )
    };

    renderTryInfo = () =>{
        const free = this.props.question.grade_policy.free_tries;
        const total_tries = this.props.question.grade_policy.max_tries;
        const completed_tries = this.props.question.tries.filter(aTry=>aTry[0]).length;
        const penalty = this.props.question.grade_policy.penalty_per_try;

        return (
            <Row style={{float:"right", paddingRight:"8px"}}>
                <Col>{Math.max(0, free-completed_tries)+"/"+free+" free tries remaining"}</Col>
                {(total_tries!==0)?<Col>{Math.max(0, total_tries-completed_tries)+"/"+total_tries+" tries remaining"}</Col>:<Col>You have unlimited tries.</Col>}
                {(penalty!==0)&&(!this.props.options.no_try_deduction)&&<Col>{penalty+"% deduction per try after first"}</Col>}
            </Row>
        )
    }

    render() {
        const color = this.getBorder();
        return (
            <div>
                <Card
                    type={"inner"}
                    title={
                        <QuestionStatsCollapse question={this.props.question} hide_feedback={this.props.options.hide_feedback}>
                            <Typography.Title level={4}>{`${(this.props.index+1)}. ${this.props.options.hide_titles? '':this.props.question.title}`}</Typography.Title>
                        </QuestionStatsCollapse>
                    }
                    extra={
                        <span>
                            {`${this.props.question.grade?Math.round(this.props.question.grade*this.props.question.mark/100):0} / ${this.props.question.mark}`}
                        </span>}
                >
                    <FormItem
                        help={!this.props.options.hide_feedback && <div style={{paddingTop:"8px"}}>{this.getFeedback()}</div>}
                    >
                        <div
                            style={{backgroundColor:theme["@white"], border:"2px solid", borderColor:color, padding:6}}
                        >
                            {this.renderQuestionText()}
                            {this.props.question.responses && this.props.question.responses.length>0 && <>
                                <Divider style={{marginTop: "12px", marginBottom: "12px"}}/>
                                {this.renderComponents()}
                            </>}
                        </div>
                    </FormItem>
                    <Divider/>
                    {this.props.question.responses && this.props.question.responses.length > 0 && <>
                        <Button type="primary" ghost icon="save" onClick={this.props.save} loading={this.props.loading}>Save</Button>
                        <Button type="danger" icon="upload" onClick={this.props.submit} style={{float: "right"}} loading={this.props.loading}>Submit</Button>
                        {this.renderTryInfo(this.props.question)}
                    </>}
                </Card>
            </div>
        )
    }
}
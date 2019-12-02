import React from "react";
import {
    Button,
    Card,
    Divider,
    Input,
    Tag,
    Select,
    Radio,
    Checkbox,
    Empty,
    message,
    Form,
    Typography,
    Popover, Tooltip
} from "antd";
import theme from "../../config/theme";
import QuestionStatsCollapse from "./QuestionStatsCollapse";
import RandomID from "../../utils/RandomID";
import SageCell from "../SageCell";

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

    // NEED FIX
    renderResponseTextLine = (c, color) => (
        <div style={{marginTop: 6, marginBottom: 16}}>
            <strong>{c.text}</strong>
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
                    default:
                        return <span>Error Response</span>
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
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px",
                    borderColor: color
                }}
            >
                {this.renderResponseTextLine(c, color)}
                <FormItem
                    hasFeedback
                    validateStatus={this.getStatus(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0)}
                    help="placeholder for feedback if possible"
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
                c.choices.map(r=><Option key={r} value={r}>{r}</Option>)
            }
        </Select>;

        return (
            <div
                key={id}
                style={{
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px",
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
            height: '30px',
            lineHeight: '30px',
        };

        const color = this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);

        const uncheck = (r) => {
            let answers = this.state.answers;
            console.log(answers[id], r)
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
                    help="placeholder for feedback if possible"
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
                        c.choices.map(r=><Radio key={r} value={r} style={optionStyle} onClick={()=>{uncheck(r)}}>{r}</Radio>)
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
                        help="placeholder for feedback if possible"
                    >
                    <CheckboxGroup
                        options={
                            c.choices &&
                            c.choices.map(r=>({label: r, value: r}))
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
                    backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px", border:"2px",
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
        const { Meta } = Card;

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
                            {`${Math.round(this.props.question.grade * this.props.question.mark / 100)} / ${this.props.question.mark}`}
                        </span>}
                >
                    <Typography.Text strong>{this.props.question.text}</Typography.Text>
                    {this.props.question.responses.length > 0 && <>
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
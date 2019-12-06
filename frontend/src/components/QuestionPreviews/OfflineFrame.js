import React from "react";
import {Button, Card, Divider, Input, Tag, Select, Radio, Checkbox, Empty} from "antd";
import theme from "../../config/theme";
import SageCell from "../SageCell";

/* Preview Component */
export default class OfflineFrame extends React.Component {

    state = {
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

    // submit and mark the answer
    submit = () => {
        this.setState({marked: !this.state.marked});
        let grade = 0;
        Object.keys(this.state.answers).forEach(id=>{
            if (this.props.question.responses[id-1]) {
                grade += this.calculateMark(id, this.props.question.responses[id-1].answers);
            }
        });
        this.setState({grade});
    };

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

    /* render the question response by type */
    renderComponents = () => {
        let id=0;
        if (this.props.question.responses) {
            return this.props.question.responses.map(component => {
                id++;
                switch (component.type.name) {
                    case "input":
                        return this.renderInput(component, id);
                    case "multiple":
                        if (component.type.dropdown) {
                            return this.renderDropDown(component, id);
                        }
                        else {
                            return this.renderMultiple(component, id);
                        }
                    case "sagecell":
                        return this.renderSageCell(component, id);
                    default:
                        return <span>Error Response</span>
                }
            })
        }
        else return <Empty/>
    };

    /* render the input type response */
    renderInput = (c, id) => {
        let renderMark;
        const mark = this.calculateMark(id, c.answers);
        // render the mark only when marked
        renderMark = this.state.marked ? <span style={{color: "red"}} >{mark}</span> : undefined;

        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <p>
                    <strong>{c.text}</strong>
                </p>
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
                c.answers.map(r=><Option key={r.text} value={r.text}>{r.text}</Option>)
            }
        </Select>;

        return (
            <div
                key={id}
                style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            >
                <p>
                    <strong>{c.text}</strong>
                </p>
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
            height: '30px',
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
                        c.answers.map(r=><Radio key={r.text} value={r.text} style={optionStyle}>{r.text}</Radio>)
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
                    c.answers.map(r=>({label: r.text, value: r.text}))
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
                <p><strong>{c.text}</strong></p>
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
                <p>
                    <strong>{c.text}</strong>
                </p>
                <SageCell src={c.type.src} language={c.type.language} params={c.type.params} script={c.type.code}/>
            </div>
        )
    };

    render() {
        const { Meta } = Card;

        let Sum = 0;
        if (this.props.question.responses) {
            this.props.question.responses.forEach(c=> {
                if (c.answers) {
                    if (c.type.single!==false  || c.type.name !== "multiple") {
                        Sum += Math.max.apply(Math, c.answers.map(function(o) { return o.grade; }));
                    }
                    else {
                        c.answers.forEach(r => {
                            if (r.grade > 0) {
                                Sum += r.grade;
                            }
                        })
                    }
                }
            });
        }

        return (
            <div>
                <Card
                    type={"inner"}
                    title={this.props.question.title}
                    extra={this.state.grade+"/"+Sum}
                >
                    <Meta
                        title={this.props.question.text}
                        //description={this.renderTags()}
                    />
                    {this.props.question.responses.length > 0 && <>
                        <Divider style={{marginTop: "12px", marginBottom: "12px"}}/>
                        {this.renderComponents()}
                        <Divider/>
                    <Button type="danger" icon="upload" onClick={this.submit}>Submit</Button>
                    </>
                    }
                </Card>
            </div>
        )
    }
}
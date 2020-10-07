import React from "react";
import {Button, Card, Checkbox, Divider, Empty, Input, message, Radio, Select, Skeleton, Tag} from "antd";
import theme from "../../config/theme";
import SageCell from "../SageCell";
import XmlRender from "../Editor/XmlRender";
import DecisionTreeFrame from "./DecisionTreeFrame";
import {UserConsumer} from "../../contexts/UserContext";
import TraceResult from "../DecisionTree/TraceResult";
import TestDecisionTree from "../../networks/TestDecisionTree";

/* Preview Component */
export default class OfflineFrame extends React.Component {

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

    // test decision tree
    test = () => {
        if (this.state.loading) {
            return;
        }
        this.setState({results: undefined})
        this.setState({loading: true})
        let inputs = {};
        console.log(this.state.answers)
        Object.keys(this.state.answers).forEach(id=>{
            if (this.props.question.responses[id-1]) {
                inputs[this.props.question.responses[id-1].identifier] = this.state.answers[id];
            }
        });
        console.log('inputs: ',inputs);
        console.log(this.props.question)
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

    /* render the question response by type */
    renderComponents = () => {
        let id=0;
        if (this.props.question.responses) {
            return this.props.question.responses.map(component => {
                id++;
                switch (component.type.name) {
                    case "input":
                        return this.renderInputTree(component, id);
                        // return this.renderInput(component, id);
                    case "multiple":
                        if (component.type.dropdown) {
                            return this.renderDropDown(component, id);
                        }
                        else {
                            return this.renderMultiple(component, id);
                        }
                    case "sagecell":
                        return this.renderSageCell(component, id);
                    case "tree":
                        return this.renderInputTree(component, id)
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

    /* render decision tree type response */

    renderInputTree = (c, id) => {
        const variables = this.props.question.variables;
        const tree = this.props.question.tree;
        return (
            <UserConsumer key={id}>
                {User => <DecisionTreeFrame 
                    token={User.token} 
                    tree={tree} 
                    data={c} 
                    script={(variables && variables.hasOwnProperty(0))? variables[0].value: undefined}
                    test = {this.test}
                    onChange = {
                        (e)=> {
                            let answers = this.state.answers;
                            answers[id] = e.target.value;
                            this.setState({answers});
                        }
                    }
                    />}
            </UserConsumer>
        )
    }

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
                    title={this.props.question.title}
                    extra={this.state.grade+"/"+Sum}
                >
                    <XmlRender style={{border: undefined}}>{this.props.question.text}</XmlRender>
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
                    <Button type="danger" icon="upload" onClick={this.submit}>Submit</Button>
                    </>
                    }
                </Card>
            </div>
        )
    }
}
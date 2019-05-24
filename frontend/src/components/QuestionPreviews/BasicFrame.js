import React from "react";
import {Button, Card, Divider, Input, Tag, message} from "antd";
import questions from "../../mocks/Questions";
import theme from "../../config/theme";

export default class BasicFrame extends React.Component {

    question = questions[0];

    state = {
        marked: false,
        grade: "",
        highestWeight: 0,
        answers: {}
    };

    componentDidMount() {
        let Sum = 0;
        this.question.components.forEach(c=> {
            Sum += Math.max.apply(Math, c.response.map(function(o) { return o.weight; }));
        });
        this.setState({highestWeight: Sum})
    }

    renderComponents = () => {
        let id=0;
        return this.question.components.map(component => {
            id++;
            switch (component.type) {
                case "input":
                    return this.renderInput(component, id);
            }
        })
    };

    renderInput = (c, id) => {
        let renderMark;
        const mark = this.calculateMark(id, c.response);
        renderMark = this.state.marked?<span style={{color: "red"}}>{mark}</span>:undefined

        return (
            <div style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}>
                <p><strong>{c.body}</strong></p>
                <Input
                    addonBefore="Answer"
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

    renderTags = () => {
        return this.question.tags.map(tag => (<Tag color={theme["@primary-color"]}>{tag}</Tag>))
    };

    save = () => {
        message
            .loading('Saving..', 2.5)
            .then(() => message.success('Saved', 2.5))
            .then(() => message.info('This is only a mock for saving', 2.5));
    };

    submit = () => {
        this.setState({marked: !this.state.marked});
        let grade = 0;
        Object.keys(this.state.answers).forEach(id=>{
            grade += this.calculateMark(id, this.question.components[id-1].response);
        })
        this.setState({grade});
    };

    calculateMark = (id, response) => {
        let mark = 0;
        const answer = this.state.answers[id];
        response.forEach(r=>{
            if (r.body == answer) {
                mark = r.weight;
            }
        })
        return mark;
    };

    render() {
        const { Meta } = Card;
        const ButtonGroup = Button.Group;

        return (
            <div>
                <Card
                    type={"inner"}
                    title={this.question.title}
                    extra={this.state.grade+"/"+this.state.highestWeight}
                    //bodyStyle={{backgroundColor: theme["@white"]}}
                >
                    <Meta
                        title={this.question.background}
                        //description={this.renderTags()}
                    />
                    <Divider style={{marginTop: "12px", marginBottom: "12px"}}/>
                    {this.renderComponents()}
                    <Divider/>
                    <ButtonGroup>
                        <Button type="default" icon="save" onClick={this.save}>Save</Button>
                        <Button type="danger" icon="upload" onClick={this.submit}>Submit</Button>
                    </ButtonGroup>
                </Card>
            </div>
        )
    }
}
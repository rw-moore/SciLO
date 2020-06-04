import React from 'react';
import {Button, Col, Row, Tag} from "antd";
import XMLToReact from '@condenast/xml-to-react';
import {Context, Node} from "react-mathjax2";
import SageCell from "./SageCell";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-xml";

function Formula(props) {
    return (
        <Context input="tex">
            <Node inline={props.inline}>{props.value || props.children || ""}</Node>
        </Context>
    );
}

const a = `
unordered list and ordered list
<ul>
    <li>Apple</li>
    <li>Orange</li>
</ul>
<ol>
    <li>Apple</li>
    <li>Orange</li>
</ol>

<img src="https://cataas.com/cat?338"/>

<Math>\\frac{1}{\\sqrt{2}}\\cdot 2</Math>

<Cell script="123"/>
`;



const xmlToReact = new XMLToReact({
    Editor: (attrs) => ({ type: React.Fragment, props: attrs }),
    Math: (attrs) => ({type: Formula, props: attrs}),
    MathInline: (attrs) => ({type: Formula, props: {...attrs, inline: true}}),
    Var: (attrs) => ({type: Tag, props: attrs}),
    style: (attrs) => ({type: 'style', props: attrs}),
    Cell: (attrs) => ({type: SageCell, props: attrs}),
    ul: (attrs) => ({ type: 'ul', props: attrs }),
    ol: (attrs) => ({ type: 'ol', props: attrs }),
    li: (attrs) => ({ type: 'li', props: attrs }),
    b: (attrs) => ({ type: 'b', props: attrs }),
    a: (attrs) => ({ type: 'a', props: attrs }),
    p: (attrs) => ({ type: 'p', props: {...attrs, className: attrs.class }}),
    br: (attrs) => ({type: 'br', props: attrs}),
    img: (attrs) => ({type: 'img', props: attrs}),  // XSS ATTACK vulnerable
});

export default class NewEditor extends React.Component {

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     this.ref.current.resizableTextArea.textArea.selectionStart = this.state.start;
    //     this.ref.current.resizableTextArea.textArea.selectionEnd = this.state.end;
    // }

    constructor(props) {
        super(props);

        const value = props.value || props.initValue || "";
        const render = xmlToReact.convert(`<Editor>${value}</Editor>`);

        this.state = {
            code: value || "",
            start: null,
            end: null,
            render: render
        };

        this.ref = React.createRef();
    }

    handleChange = event => {
        //const value = event.target.value;

        if (!('value' in this.props)) {
            this.setState({ code: event });
        }

        const render = xmlToReact.convert(`<Editor>${event}</Editor>`);

        this.setState({
            // start: event.target.selectionStart,
            // end: event.target.selectionEnd,
            render: render,
        });

        this.triggerChange(event);

        //console.log(`text: ${event.target.value}\nstart: ${event.target.selectionStart} end: ${event.target.selectionEnd}`);
    };

    handleSelect = event => {
        this.setState({
            start: event.target.selectionStart,
            end: event.target.selectionEnd,
        });
        console.log(`text: ${event.target.value}\nstart: ${event.target.selectionStart} end: ${event.target.selectionEnd}`);
    };

    handleKeyDown = (event) =>{
        let value, start, end;
        const tab = 4;
        console.log(this.ref);
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            const selectionStart = event.target.selectionStart;
            const selectionEnd = event.target.selectionEnd;
            value = event.target.value.substring(0, selectionStart) + '    ' + event.target.value.substring(selectionEnd);
            start = selectionEnd + tab - (selectionEnd - selectionStart);
            end = selectionEnd + tab - (selectionEnd - selectionStart);
            this.setState({
                start: start,
                end: end,
                code: value
            });

            this.triggerChange(value);
            console.log(start, end);
        }
        if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            let selectionStart = event.target.selectionStart;
            let selectionEnd = event.target.selectionEnd;
            let value = event.target.value;

            const beforeStart = value
                .substring(0, selectionStart)
                .split('')
                .reverse()
                .join('');
            const indexOfTab = beforeStart.indexOf('    ');
            const indexOfNewline = beforeStart.indexOf('\n');

            if (indexOfTab !== -1 && indexOfTab < indexOfNewline) {
                value =
                    beforeStart
                        .substring(indexOfTab + tab)
                        .split('')
                        .reverse()
                        .join('') +
                    beforeStart
                        .substring(0, indexOfTab)
                        .split('')
                        .reverse()
                        .join('') +
                    value.substring(selectionEnd);

                start = selectionStart - tab;
                end = selectionEnd - tab;
            }

            this.setState({
                start: start,
                end: end,
                code: value
            });

            this.triggerChange(value);
        }

    };

    triggerChange = changedValue => {
        // Should provide an event to pass value to Form.
        const { onChange } = this.props;
        if (onChange) {
            onChange({
                ...this.state,
                code: changedValue
            });
        }
    };

    render() {
        return (
            <div>
                <Col span={12}>
                    {/*<Editor*/}
                    {/*value={this.state.code}*/}
                    {/*onValueChange={this.handleChange}*/}
                    {/*highlight={code => highlight(code, languages.markup)}*/}
                    {/*padding={4}*/}
                    {/*style={{*/}
                    {/*background: "white",*/}
                    {/*lineHeight: 1.5,*/}
                    {/*border: 'solid 1px #ddd',*/}
                    {/*borderRadius: "4px"*/}
                    {/*}}*/}
                    {/*/>*/}
                    <Row>
                        {/*<Input.TextArea*/}
                            {/*ref={this.ref}*/}
                            {/*value={this.state.code}*/}
                            {/*onChange={this.handleChange}*/}
                            {/*onSelect={this.handleSelect}*/}
                            {/*onKeyDown={this.handleKeyDown}*/}
                        {/*/>*/}
                        <AceEditor
                            placeholder="Placeholder Text"
                            mode="xml"
                            theme="textmate"
                            name="blah2"
                            //onLoad={this.onLoad}
                            onChange={this.handleChange}
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            value={this.state.code}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 4,
                            }}/>
                    </Row>
                    <Row>
                        <Button onClick={()=>{this.setState({code: a})}}>1</Button>
                        <Button>2</Button>
                        <Button>3</Button>
                        <Button>4</Button>
                    </Row>
                </Col>
                <Col span={12}>
                    <div
                        style={{
                            height: "auto",
                            //minHeight: this.ref.current ? this.ref.current.resizableTextArea.textArea.offsetHeight: 0,
                            background: "white",
                            padding: "4px 11px",
                            lineHeight: 1.5,
                            border: 'solid 1px #ddd',
                            borderRadius: "4px",
                            overflow: "auto",
                            resize: "vertical"
                        }}
                    >
                        {this.state.render}
                    </div>
                </Col>
            </div>
        );
    }
}
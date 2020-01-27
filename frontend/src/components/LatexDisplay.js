import React, {useState} from 'react';
import { Fraction, toTex, Expression } from 'algebra.js';
import { Node, Context } from 'react-mathjax2';
import { InlineMath } from 'react-katex';
import {Button, Divider, Input} from "antd";
import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill'
import SageCell from "./SageCell";
import Editor from './Editor';
import NewEditor from "./NewEditor";
import XmlRender from "./Editor/XmlConverter";
import {XmlEditor} from "./Editor/XmlEditor";

function Formula(props) {
    return (
        <Context input="tex">
            <Node inline>{props.tex}</Node>
        </Context>
    );
}

// inserts the required css to the <head> block.
// You can skip this, if you want to do that by your self.
addMathquillStyles();

export default function LatexDisplay(props) {
    const [text, setText] = useState('\\frac{1}{\\sqrt{2}}\\cdot 2');
    const [text2, setText2] = useState('');
    const [load, setLoad] = useState(false);
    const [cell, setCell] = useState(undefined);
    const [info, setInfo] = useState(undefined);
    const [render, setRender] = useState(undefined);
    // const a = new Fraction(1, 5);
    // const b = new Fraction(2, 7);
    // const answer = a.multiply(b);
    //
    // const question = <Formula tex={`${toTex(a)} × ${toTex(b)} = ${toTex(answer)}`} />;
    // const lambda = new Expression("lambda").add(3).divide(4);
    // const Phi = new Expression("Phi").subtract(new Fraction(1, 5)).add(lambda);
    // const question2 =  <InlineMath>{toTex(Phi)}</InlineMath>;

    return (
        <div style={{width: "75%", marginLeft: "12.5%", marginTop:"32px"}}>
            <Editor onXmlSerialize={(xml)=>{setRender(XmlRender(xml))}}/>
            {/*<XmlEditor/>*/}
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
                {render}
            </div>
            <NewEditor/>
            <Divider/>
            Mathquill-React:
            <MathQuill
                style={{background: "white"}}
                latex={text} // Initial latex value for the input field
                onChange={mathField => {
                    // Called everytime the input changes
                    console.log(mathField);
                    setText(mathField.latex());
                    setText2(mathField.text())
                }}
            />
            <span> As text: {text2}</span>
            <Divider/>
            react-mathjax2: <Formula tex={text} />
            <Divider/>
            react-katex: <InlineMath>{text}</InlineMath>
            <Divider/>
            <Button onClick={()=>setLoad(!load)}>Load to SageCell</Button>
            { load && <SageCell script={text} onChange={(value)=>setText(value)} getCellInfoReference={(value)=>setInfo(value)}/>}
            <Button onClick={()=>{
                console.log(info);
                console.log(info.session.rawcode);
                console.log(info.session.output_block.innerText);
                setText("test")
            }}>Log SageCell</Button>
            <span>{text}</span>
        </div>
    );
}
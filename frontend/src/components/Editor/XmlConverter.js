import XMLToReact from "@condenast/xml-to-react";
import React from "react";
import {Tag} from "antd";
import SageCell from "../SageCell";
import {Context, Node} from "react-mathjax2";

function Formula(props) {
    return (
        <Context
            //script="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=AM_HTMLorMML"
            input="tex">
            <Node inline={props.inline}>{props.value || props.children || ""}</Node>
        </Context>
    );
}

const preProcess = (value) => (
    value || ""
);

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

export default (value)=> xmlToReact.convert(`<Editor>${preProcess(value)}</Editor>`);
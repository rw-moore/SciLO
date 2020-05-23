import XMLToReact from "@condenast/xml-to-react";
import React from "react";
import {Tag} from "antd";
import SageCell from "../SageCell";
import {Context, Node} from "react-mathjax2";

function Formula(props) {
    return (
        <Context
            input="tex">
            <Node inline={props.inline}>{props.value || props.children || ""}</Node>
        </Context>
    );
}

const preProcess = (value) => (
    value || ""
);

export class Table {
    reference = {
        E : {
            type: "static",
            description: "A semantic element in XML format and will not create parent elements.",
            method: (attrs) => ({ type: React.Fragment, props: attrs })
        },
        M : {
            type: "static",
            description: "A Tex field to render its children.",
            method: (attrs) => ({type: Formula, props: {...attrs, className: attrs.class}}),
            example: "<M>\\frac{1}{\\sqrt{2}}\\cdot 2</M>"
        },
        m : {
            type: "static",
            description: "An inline Tex field to render its children.",
            method: (attrs) => ({type: Formula, props: {...attrs, className: attrs.class, inline: true}}),
            example: "<m>\\frac{1}{\\sqrt{2}}\\cdot 2</m>"
        },
        v : {
            type: "static",
            description: "A variable field will render its children as the variable in the question script.",
            method: (attrs) => ({type: Tag, props: {...attrs, className: attrs.class}}),
        },
        Cell: {
            type: "static",
            description: "Will render a SageCell Embedded Component and use its children as initial codes.",
            method: (attrs) => ({type: SageCell, props: {...attrs, className: attrs.class}}),
            example: '<Cell script="yourScript"/>'
        },
        span: {
            type: "html",
            description: "A span tag will render its children elements inline."
        },
        div: {
            type: "html",
            description: "A div tag will render its children elements."
        },
        br: {
            type: "html",
            description: "A br tag creates a linebreak."
        },
        a: {
            type: "html",
            description: "An a tag creates a hyperlink as the standard html tag."
        },
        b: {
            type: "html",
            description: "A b tag makes its children bold."
        },
        img: {
            type: "html",
            description: "An img tag can source an internet image.",
            example: '<img src="https://cataas.com/cat?338" alt="cat picture"/>'
        },
        p: {
            type: "html",
            description: "A p tag creates a paragraph."
        },
        ul: {
            type: "html",
            description: "unordered list."
        },
        ol: {
            type: "html",
            description: "ordered list."
        },
        li: {
            type: "html",
            description: "list item."
        },
        style: {
            type: "html",
            description: "html style tag."
        }

    }

    getTable = () => (
        Object.fromEntries(Object.entries(this.reference).map(
            tag => [tag[0],
                tag[1].method!==undefined ?
                    tag[1].method :
                    (attrs) => ({ type: tag[0], props: {...attrs, className: attrs.class } })
            ]))
    )

    // getCompleter = () => ({
    //     getCompletions: (editor, session, pos, prefix, callback) => {
    //         callback(null, Object.entries(this.reference).map(function (word) {
    //             return {
    //                 caption: word[0],
    //                 value: "<"+word[0],
    //                 meta: word[1].type
    //             };
    //         }));
    //
    //     }
    // })
}

const xmlToReact = new XMLToReact(new Table().getTable());

export default (value)=> xmlToReact.convert(`<E>${preProcess(value)}</E>`);
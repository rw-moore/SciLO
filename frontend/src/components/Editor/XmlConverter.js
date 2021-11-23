import XMLToReact from "@condenast/xml-to-react";
import React from "react";
import {Input, message, Select, Tag, Tooltip} from "antd";
import SageCell from "../SageCell";
import XmlRender from "../Editor/XmlRender";
import {Context, Node} from "react-mathjax2";
import config  from "./MathJaxConfig";

const timeout = 1500;
const timerId = {
    id: undefined,
    backup: undefined
};
function Formula(props) {
    var children = [];
    if (props.children) {
        children = collectChildren(props.children);
    }
    const func = () => {
        console.log('func called', props.children);
        if (window.MathJax === undefined) {
            setTimeout(func, timeout);
        } else {
            let nodes = document.getElementsByClassName("MathJax_Preview");
            console.log('nodes', nodes)
            if (nodes.length === 0 && timerId.backup === undefined) {
                timerId.backup = true;
                setTimeout(func, timeout);
            }
            let found = false;
            for (let i=0;i<nodes.length;i++) {
                let node = nodes[i];
                console.log('node', node);
                if (node.children.length > 0) {
                    found = true;
                } 
            }
            if (found) {
                console.log("rescheduling");
                window.MathJax.Hub.Queue(window.MathJax.Hub.Typeset());
                setTimeout(func, timeout);
            }
        }
    }
    if (timerId.id === undefined) {
        timerId.id = setTimeout(func, timeout);
    }
    return (
        <Context
            input="tex"
            onError={(MathJax, error) => {
                console.warn(error);
                console.log("Encountered a MathJax error, re-attempting a typeset!");
                MathJax.Hub.Queue(MathJax.Hub.Typeset());
            }}
            // onLoad={()=>setTimeout(func, timeout)}
            script={config.script}
            options={config.options}
        >
            <Node inline={props.inline}>{props.value ? props.value.replace("\\\\", "\\") : children ? children : ""}</Node>
        </Context>
    );
}

const ibox_vis = {};
function IBox(props) {
    // console.log('ibox_props',props);
    var resp = null;
    if (!props.data.responses){
        return <span>{`<ibox id="${props.id}"/>`}</span>
    }
    props.data.responses.forEach(response=>{
        if (response.identifier === props.id){
            resp=response;
        }
    })
    if ((resp == null) || (resp.type.name !== "tree")) {
        message.error("IBox must be related to an input field");
        return <></>
    }
    if (!(resp.id in ibox_vis)) {
        ibox_vis[resp.id] = false;
    }
    var onChange = e => {
        const {value} = e.target;
        const reg = new RegExp(resp.pattern, resp.patternflag);
        if (reg.test(value) || value==='') {
            ibox_vis[resp.id] = false;
        } else {
            ibox_vis[resp.id] = true;
        }
        props.data.onChange(e);
    }
    let tip = ''
    if (resp.patternfeedback) {
        tip = resp.patternfeedback;
    } else {
        if (resp.patterntype !== "Custom") {
            tip = "Your answer should be a"
            if (/^[aeiou].*/i.test(resp.patterntype)) {
                tip +=  'n'
            }
            tip += ' '+resp.patterntype
        } else {
            tip = "Your answer does not meet the format of the question"
        }
    }
    return (
        <span
            key={resp.identifier}
            style={{width:75,paddingInline:"8px",display:"inline-block"}}
        >
            <Tooltip
                id={resp.identifier+'_tooltip'}
                title={tip}
                visible={ibox_vis[resp.id]}
            >
                <Input
                    id={resp.identifier}
                    disabled={props.data.disabled}
                    value={(props.data.answers[resp.id])||''}
                    size="small"
                    onChange={onChange}
                />
            </Tooltip>
        </span>
    )
}
function DBox(props) {
    // console.log('dbox_props', props);
    var resp = null;
    if (!props.data.responses){
        return <span>{`<dbox id="${props.id}"/>`}</span>
    }
    props.data.responses.forEach(response=>{
        if (response.identifier === props.id){
            resp=response;
        }
    });
    if ((resp == null) || (resp.type.name !== "multiple") || !resp.type.dropdown) {
        message.error("DBox must be related to dropdown multiple choice field");
        return <></>
    }

    return (
        <span
            key={resp.identifier}
            style={{width:75,paddingInline:"8px",display:"inline-block"}}
        >
            <Select
                mode={resp.type.single?"default":"multiple"}
                disabled={props.data.disabled}
                value={props.data.answers && props.data.answers[resp.id]}
                style={{width:"100%"}}
                onChange={props.data.onChange}
            >
                {
                    resp.answers && // answers may be undefined
                    resp.answers.map(r=><Select.Option key={resp.identifier} value={r.text}><XmlRender style={{border: undefined}}>{r.text}</XmlRender></Select.Option>)
                }
            </Select>
        </span>
    )
}
function QImg(props) {
    if (!props.data.images) {
        return <span>{`<QImg index="${props.index}"/>`}</span>
    }
    const img = props.data.images[props.index];
    // console.log(props.data.images);
    // console.log('img', img)
    if (!img) {
        return <span style={{color:"red"}}>Could not find Image</span>
    } else if (img.originFileObj) {
        return <img src={URL.createObjectURL(img.originFileObj)} alt={"Question"}/>
    } else {
        return <img src={img.url} alt={"Question"}/>
    }
}

const preProcess = (value) => (
    value || ""
);

function collectChildren(children) {
    var out = [];
    if (!children) {
        return '';
    }
    for (var i=0; i<children.length; i++){
        if (typeof(children[i]) === 'object' && children[i] !== null) {
            if (children[i].props.value) {
                out.push(children[i].props.value);
            } else {
                out.push(collectChildren(children[i].props.children));
            }
        } else {
            out.push(children[i]);
        }
    }
    return out.join('');
}

export class Table {
    reference = {
        E : {
            type: "static",
            description: "A semantic element in XML format and will not create parent elements.",
            method: (attrs) => ({ type: React.Fragment, props: attrs })
        },
        M : {
            type: "static",
            description: "Tex in display mode.",
            method: (attrs) => ({type: Formula, props: {...attrs, className: attrs.class}}),
            example: "<M>\\frac{1}{\\sqrt{2}}\\cdot 2</M>"
        },
        m : {
            type: "static",
            description: "Tex in inline mode.",
            method: (attrs) => ({type: Formula, props: {...attrs, className: attrs.class, inline: true}}),
            example: "<m>\\frac{1}{\\sqrt{2}}\\cdot 2</m>"
        },
        v : {
            type: "static",
            description: "For a variable in the question script.",
            method: (attrs) => ({type: Tag, props: {...attrs, className: attrs.class}}),
        },
        Cell: {
            type: "static",
            description: "Will render a SageCell Embedded Component and use its children as initial codes.",
            method: (attrs) => ({type: SageCell, props: {...attrs, className: attrs.class}}),
            example: '<Cell script="yourScript"></Cell>'
        },
        ibox: {
            type: "IBox",
            description: "Will render an embedded version of an input box into the question text.",
            method: (attrs,data) => ({type: IBox, props: {...attrs, className: attrs.class, data:data}}),
            example: '<ibox id="your identifier"></ibox>'
        },
        dbox: {
            type: "static",
            description: "Will render an embedded version of a dropdown box into the question text.",
            method: (attrs, data) => ({type: DBox, props: {...attrs, className:attrs.class, data:data}}),
            example: '<dbox id="your identifier"></dbox>'
        },
        QImg: {
            type: "QImg",
            description:"Will render an image uploaded to the Question Images.",
            method: (attrs,data) => ({type: QImg, props: {...attrs, className: attrs.class, data:data}}),
            example: '<QImg index="0"></QImg>'
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
const converter = (value, data)=> {return xmlToReact.convert(`<E>${preProcess(value)}</E>`,data)};
export default converter;
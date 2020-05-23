import React, {useEffect, useState} from 'react';
//import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/ext-language_tools"
import AceEditor from "react-ace";
import {Button, Divider, Input, Radio} from "antd";
import XmlRender from "./XmlRender";

export default function XmlEditor(props) {
    const value = (props[`data-__field`] && props[`data-__field`].value) || props[`data-__meta`].initialValue || "";
    const [code, setCode] = useState(value || "");
    const [render, setRender] = useState(true);
    const [editor, setEditor] = useState("simple");

    useEffect(() => {
        if (props[`data-__field`].value) {
            setCode(props[`data-__field`].value);
        }
    }, [props, props[`data-__field`].value]);

    const handleChange = (code) => {
        if (!('value' in props)) {
            setCode(code);
        }
        triggerChange(code);
    };

    // const handleInputChange = (code) => {
    //     triggerChange(code.target.value.replace('\n','<br/>'))
    // };


    const triggerChange = (value) =>{
        // Should provide an event to pass value to Form.
        const { onChange } = props;
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <div>
            <span>
                <Radio.Group onChange={(e)=>{setEditor(e.target.value)}} defaultValue="simple" size={"small"}>
                    <Radio.Button value="simple">Simple</Radio.Button>
                    <Radio.Button value="ace">Advanced</Radio.Button>
                </Radio.Group>
                <Divider type="vertical" hidden={editor==="simple"}/>
                <Button
                    size="small"
                    onClick={()=>{setRender(!render)}}
                    hidden={editor==="simple"}
                >
                    {render ? "Hide" : "Show"}
                </Button>
            </span>

            {   editor==="simple" ?
                <Input onChange={(e)=>handleChange(e.target.value)} value={code} />
                :
                <AceEditor
                    mode="xml"
                    theme="textmate"
                    name={props.id}
                    width="100%"
                    style={{
                        minHeight: 32,
                        height: "auto",
                        border: 'solid 1px #ddd',
                        borderRadius: "4px",
                        overflow: "auto",
                        resize: "vertical"
                    }}
                    maxLines={Infinity}
                    //onLoad={this.onLoad}
                    onChange={handleChange}
                    fontSize={14}
                    showPrintMargin={true}
                    showGutter={true}
                    highlightActiveLine={true}
                    value={code}
                    editorProps={{$blockScrolling: true}}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 4,
                        useWorker: false
                    }}
                />
            }
            {!!(code) && editor!=="simple" && <XmlRender
                enable={render}
                value={code}
                style={{
                    height: "auto",
                    background: "white",
                    padding: "4px 11px",
                    lineHeight: 1.5,
                    borderRadius: "4px",
                    overflow: "auto",
                    resize: "vertical",
                }}
            />}
        </div>
    );
}

// class Editor extends React.Component {
//
//     static getDerivedStateFromProps(nextProps) {
//         // Should be a controlled component.
//         if ('value' in nextProps) {
//             return {
//                 ...(nextProps.value || {}),
//             };
//         }
//         return null;
//     }
//
//     constructor(props) {
//         super(props);
//
//         const value = props.value || props.initValue || "";
//         this.state = {
//             code: value || "",
//             id: randomID(),
//         };
//     }
//
//     handleChange = code => {
//         if (!('value' in this.props)) {
//             this.setState({ code });
//         }
//         this.triggerChange(code);
//     };
//
//     triggerChange = changedValue => {
//         // Should provide an event to pass value to Form.
//         const { onChange } = this.props;
//         if (onChange) {
//             onChange({
//                 ...this.state,
//                 code: changedValue
//             });
//         }
//     };
//
//     render() {
//         return (
//             <AceEditor
//                 placeholder="Placeholder Text"
//                 mode="xml"
//                 theme="textmate"
//                 name={this.props.id || this.state.id}
//                 width="100%"
//                 style={{
//                     minHeight: 32,
//                     height:"auto",
//                     border: 'solid 1px #ddd',
//                     borderRadius: "4px",
//                     overflow: "auto",
//                     resize: "vertical"
//                 }}
//                 maxLines={Infinity}
//                 //onLoad={this.onLoad}
//                 onChange={this.handleChange}
//                 fontSize={14}
//                 showPrintMargin={true}
//                 showGutter={true}
//                 highlightActiveLine={true}
//                 value={this.state.code}
//                 editorProps={{ $blockScrolling: true }}
//                 setOptions={{
//                     enableBasicAutocompletion: true,
//                     enableLiveAutocompletion: true,
//                     enableSnippets: true,
//                     showLineNumbers: true,
//                     tabSize: 4,
//                 }}/>
//         );
//     }
// }
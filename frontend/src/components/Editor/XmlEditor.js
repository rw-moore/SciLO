import React, {useEffect, useState} from 'react';
//import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/ext-language_tools"
import AceEditor from "react-ace";
import {Button, Divider, Drawer, Input, Popover, Radio, Tag} from "antd";
import XmlRender from "./XmlRender";
import {Table} from "./XmlConverter";

// wrapper see https://github.com/react-component/form/issues/287
export default class XmlEditor extends React.Component {
    render() {
        const {children, ...props} = this.props
        return <Editor {...props}>{children}</Editor>
    }
}



function Editor(props) {
    const value = (props[`data-__field`] && props[`data-__field`].value) || props[`data-__meta`].initialValue || "";
    const [code, setCode] = useState(value || "");
    const [render, setRender] = useState(true);
    const [editor, setEditor] = useState("simple");
    const [help, setHelp] = useState(false)

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
                <span hidden={editor==="simple"}>
                    <Divider type="vertical"/>
                    <Button
                        size="small"
                        onClick={()=>{setRender(!render)}}
                    >
                        {render ? "Hide" : "Show"}
                    </Button>
                    <Button style={{float: "right", position: "relative", top: 4}} type="ghost" onClick={()=>setHelp(!help)} size="small">
                      Help
                    </Button>
                    <Drawer
                        title="Reference"
                        placement="right"
                        width={500}
                        closable
                        mask={false}
                        onClose={()=>setHelp(false)}
                        visible={help}
                    >
                        <h3>Available Tags</h3>
                        {
                            Object.entries(new Table().reference).map((entry, index)=>(
                                <div key={index}>
                                    <Tag><b>{entry[0]}</b></Tag>
                                    {entry[1].example &&
                                        <Popover content={
                                            <div>
                                                <code>{entry[1].example}</code>
                                                <XmlRender value={entry[1].example}/>
                                            </div>} trigger={"click"} title="example"
                                        >
                                            <Button type={"link"}>Example</Button>
                                        </Popover>
                                    }
                                    <div style={{margin: 4}}>{entry[1].description}</div>
                                    <br/>
                                </div>
                            ))
                        }
                    </Drawer>
                </span>
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

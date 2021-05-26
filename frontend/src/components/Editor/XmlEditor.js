import React, {useEffect, useState} from 'react';
//import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/ext-language_tools"
import AceEditor from "react-ace";
import {Button, Divider, Drawer, Input, Popover, Radio, Tag} from "antd";
import XmlRender from "./XmlRender";
import {Table} from "./XmlConverter";
import { UserConsumer } from '../../contexts/UserContext';

// wrapper see https://github.com/react-component/form/issues/287
export default class XmlEditor extends React.Component {
    render() {
        const {children, ...props} = this.props;
        // console.log(this.props);
        return (
            <UserConsumer>
                {
                    (User) => {
                        if (User && User.user.preferences['Prefer Advanced Text']) {
                            props.editor = "ace";
                        } else {
                            props.editor = "simple";
                        }
                        return (<Editor {...props}>{children}</Editor>)
                    }
                }
            </UserConsumer>
        )
    }
}



function Editor(props) {
    // console.log(props);
    const value = props.initialValue || "";
    const [code, setCode] = useState(value);
    const [render, setRender] = useState(true);
    const [editor, setEditor] = useState(props.editor);
    const [help, setHelp] = useState(false)

    useEffect(() => {
        if (props[`data-__field`] && props[`data-__field`].value!==undefined) {
            setCode(props[`data-__field`].value);
        }
    }, [props]);

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
                <Radio.Group onChange={(e)=>{setEditor(e.target.value)}} defaultValue={editor} size={"small"}>
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
                <Input.TextArea
                    onChange={(e)=>handleChange(e.target.value)} 
                    value={code} 
                    autoSize
                />
                :
                <AceEditor
                    mode="xml"
                    theme="textmate"
                    name={props.id}
                    width="100%"
                    style={{
                        height: "auto",
                        border: 'solid 1px #ddd',
                        borderRadius: "4px",
                        overflow: "auto",
                        resize: "vertical"
                    }}
                    maxLines={6}
                    minLines={2}
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
                        useWorker: false,
                        wrap: true,
                        indentedSoftWrap: false,
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

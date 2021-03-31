import React from 'react';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-language_tools"


export class CodeEditor extends React.Component {

    static getDerivedStateFromProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            return {
                ...(nextProps.value || {}),
            };
        }
        return null;
    }

    state = {
        value: this.props.value || "",
    };


    handleChange = value => {
        if (!('value' in this.props)) {
            this.setState({value: value});
        }
        this.triggerChange(value);
    };

    triggerChange = value => {
        // Should provide an event to pass value to Form.
        const { onChange } = this.props;
        if (onChange) {
            onChange(value);
        }
    };

    render() {
        return (
            <div>
                <AceEditor
                    theme="textmate"
                    mode={this.props.language==="sage"?"python":"text"}
                    name="script-editor"
                    width="100%"
                    style={{
                        height: "auto",
                        border: 'solid 1px #ddd',
                        borderRadius: "4px",
                        overflow: "auto",
                        resize: "vertical"
                    }}
                    maxLines={10}
                    minLines={2}
                    onChange={this.handleChange}
                    fontSize={14}
                    showPrintMargin={true}
                    showGutter={true}
                    highlightActiveLine={true}
                    value={this.props.value || this.state.value}
                    editorProps={{$blockScrolling: true}}
                    setOptions={{
                        useWorker: false,
                        //highlightActiveLine: false,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 4,
                    }}
                />
            </div>
        );
    }
}
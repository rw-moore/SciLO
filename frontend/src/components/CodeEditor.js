import React from 'react';
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python'

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

    constructor(props) {
        super(props);

        const value = props.value || props.initValue || "";
        this.state = {
            code: value || ""
        };
    }

    handleChange = code => {
        if (!('value' in this.props)) {
            this.setState({ code });
        }
        this.triggerChange(code);
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

    highlightByLanguage = () => {
        switch (this.props.language) {
            case 'sage':
                return (languages.python);
            case 'gap':
                return(languages.gap);
            case 'gp':
                return(languages.parigp);
            case 'html':
                return (languages.html);
            case 'r':
                return (languages.r);
            default:
                return (languages.clike);
        }
    };

    render() {
        return (
            <Editor
                value={this.state.code}
                onValueChange={this.handleChange}
                highlight={code => highlight(code, this.highlightByLanguage())}
                padding={4}
                style={{
                    fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",\n' +
                        '    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",\n' +
                        '    sans-serif',
                    lineHeight: 1.5,
                    border: 'solid 1px #ddd',
                    borderRadius: "4px",
                    position: 'relative',
                    top: '6px'
                }}
            />
        );
    }
}
import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python'

const code = `my_string = "Hello, World!"
print(my_string)
`;

export class CodeEditor extends React.Component {
    state = { code };

    highlightByLanguage = () => {
        switch (this.props.language) {
            case 'Python':
                return (languages.python);
            case 'C-like':
                return (languages.clike);
            case 'Javascript':
                return (languages.js);
            case 'Json':
                return (languages.json);
            default:
                return (languages.python);
        }
    };

    render() {
        return (
            <Editor
                value={this.state.code}
                onValueChange={code => this.setState({ code })}
                highlight={code => highlight(code, this.highlightByLanguage())}
                padding={4}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    lineHeight: 1.5,
                    border: 'solid 1px #ddd',
                    borderRadius: "4px"
                }}
            />
        );
    }
}
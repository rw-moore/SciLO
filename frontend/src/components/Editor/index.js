// Import the Slate editor factory.
import { createEditor, Editor, Text, Editor as Transfroms  } from 'slate';

// Import the Slate components and React plugin.
import { Slate, Editable, withReact,   } from 'slate-react';

import React, {useMemo, useState, useCallback} from 'react';

import escapeHtml from 'escape-html'

export default function App(props) {
    const editor = useMemo(() => withReact(createEditor()), []);
    // Add the initial value when setting up our state.
    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [{ text: 'A line of text in a paragraph.' }],
        },
    ]);

    const serialize = node => {
        if (Text.isText(node)) {
            return escapeHtml(node.text)
        }

        const children = node.children.map(n => serialize(n)).join('');

        switch (node.type) {
            case 'quote':
                return `<blockquote><p>${children}</p></blockquote>`;
            case 'paragraph':
                return `<p>${children}</p>`;
            case 'link':
                return `<a href="${escapeHtml(node.url)}">${children}</a>`;
            default:
                return children
        }
    };

    return (
        <Slate
            editor={editor}
            value={props.value || value}
            onChange={value => {
                if (props.onChange) {
                    props.onChange(value);
                } else {
                    setValue(value);
                    console.log(value)
                }
                if (props.onXmlSerialize) {
                    const xmlString = serialize({children: props.value || value});
                    console.log(xmlString);
                    props.onXmlSerialize(xmlString);
                }

            }}
        >
            <Editable
                style={props.style || {
                    padding: 4,
                    background: "white",
                    lineHeight: 1.5,
                    border: 'solid 1px #ddd',
                    borderRadius: "4px"
                }}
            />
        </Slate>
    )
}
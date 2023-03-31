import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/ext-language_tools';

export function CodeEditor(props) {
	const [value, setValue] = useState(props.value || '');

	useEffect(() => {
		setValue(props.value);
	}, [props.value]);

	const handleChange = (value) => {
		setValue(value);
		props?.onChange?.(value);
	};

	return (
		<div>
			<AceEditor
				onLoad={(editorInstance) => {
					// allow resizing of ace editor
					// could be refactored to use resizeObserver
					window.onmouseup = () => {
						editorInstance.resize();
					};
				}}
				theme="textmate"
				mode={props.language === 'sage' ? 'python' : 'text'}
				name="script-editor"
				width="100%"
				style={{
					height: `${Math.max(
						2,
						Math.min(10, ((value || '').match(/\n/g) || '').length + 1)
					)}rem`,
					border: 'solid 1px #ddd',
					borderRadius: '4px',
					overflow: 'auto',
					resize: 'vertical',
				}}
				minLines={2}
				onChange={handleChange}
				debounceChangePeriod={10}
				fontSize={14}
				showPrintMargin={true}
				showGutter={true}
				highlightActiveLine={true}
				value={value}
				editorProps={{ $blockScrolling: true }}
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

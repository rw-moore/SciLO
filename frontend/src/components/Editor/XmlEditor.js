import React, { useEffect, useState, useContext } from 'react';
//import "ace-builds/webpack-resolver";
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/ext-language_tools';
import AceEditor from 'react-ace';
import { Button, Divider, Drawer, Input, Popover, Radio, Tag } from 'antd';
import { useDrop } from 'react-dnd';
import XmlRender from './XmlRender';
import { Table } from './XmlConverter';
import { UserContext } from '../../contexts/UserContext';

function XmlEditor(props) {
	// console.log('editor props', props);
	const {
		initialValue: { text: value = '', latex = '' },
		showPreamble,
	} = props;
	const [code, setCode] = useState(value);
	const [preamble, setPreamble] = useState(latex);
	const [displayMessage, setDisplayMessage] = useState('');
	const [render, setRender] = useState(true);
	const [previewKey, setPreviewKey] = useState(1);
	const User = useContext(UserContext);
	const [editor, setEditor] = useState(
		User?.user?.preferences?.['Prefer Advanced Text'] ? 'ace' : 'simple'
	);
	const [help, setHelp] = useState(false);
	const refs = {
		ace: React.useRef(null),
	};

	const handleChange = (code) => {
		// console.log('handle', code);
		// console.log('handle', 'value' in props);
		if (!('value' in props)) {
			// console.log('setting code', code);
			setCode(code);
		}
		triggerChange(code);
	};
	const handleLatex = (latex) => {
		setPreamble(latex);
		props.changeLatex?.(latex);
	};

	useEffect(() => {
		// console.log('props changed', value, code);
		setCode(value);
	}, [value]);

	useEffect(() => {
		setPreamble(latex);
	}, [latex]);

	useEffect(() => {
		setPreviewKey((p) => p + 1);
		const timeOutID = setTimeout(() => {
			setDisplayMessage(`<m>${preamble}</m>\n${code}`);
		}, 500);
		return () => clearTimeout(timeOutID);
	}, [code, preamble]);

	const triggerChange = (value) => {
		// Should provide an event to pass value to Form.
		const { onChange } = props;
		if (onChange) {
			try {
				onChange(value);
			} catch (e) {
				console.error('xmleditor', e);
			}
		}
	};

	const [, drop] = useDrop(
		() => ({
			accept: 'DraggableUploadList',
			collect: (monitor) => ({
				isOver: monitor.isOver(),
				canDrop: monitor.canDrop(),
			}),
			hover: (item, monitor) => {},
			drop: (item, monitor) => {
				// console.log('monitor',monitor);
				// console.log('item', item);
				// console.log(code);
				console.log('drop');
				handleChange(code + `<QImg index="${item.index}"></QImg>`);
				// let out;
				// console.log(refs[editor]);
				// if (refs[editor]) {
				//     if (editor==="simple") {
				//         let start = refs[editor].resizableTextArea.textArea.selectionStart;
				//         let end = refs[editor].resizableTextArea.textArea.selectionEnd;
				//         console.log(start, end);
				//         out = code.slice(0, end) + `<QImg index="${item.index}"></QImg>` + code.slice(end);
				//     } else {
				//         refs[editor].current.editor.insert(`<QImg index="${item.index}"></QImg>`);
				//         return;
				//     }
				// } else {
				//     console.log('default');
				//     out = code+`<QImg index="${item.index}"></QImg>`
				// }
				// handleChange(out);
			},
		}),
		[code, editor, refs]
	);

	return (
		<div>
			<span>
				<Radio.Group
					onChange={(e) => {
						setEditor(e.target.value);
					}}
					defaultValue={editor}
					size={'small'}
				>
					<Radio.Button value="simple">Simple</Radio.Button>
					<Radio.Button value="ace">Advanced</Radio.Button>
					{showPreamble && <Radio.Button value="latex">Latex Preamble</Radio.Button>}
				</Radio.Group>
				<span hidden={editor !== 'ace'}>
					<Divider type="vertical" />
					<Button
						size="small"
						onClick={() => {
							setRender(!render);
						}}
					>
						{render ? 'Hide' : 'Show'}
					</Button>
					<Button
						style={{ float: 'right', position: 'relative', top: 4 }}
						type="ghost"
						onClick={() => setHelp(!help)}
						size="small"
					>
						Help
					</Button>
					<Drawer
						title="Reference"
						placement="right"
						width={500}
						closable
						mask={false}
						onClose={() => setHelp(false)}
						open={help}
					>
						<h3>Available Tags</h3>
						{Object.entries(new Table().reference).map((entry, index) => (
							<div key={index}>
								<Tag>
									<b>{entry[0]}</b>
								</Tag>
								{entry[1].example && (
									<Popover
										content={
											<div>
												<code>{entry[1].example}</code>
												<XmlRender value={entry[1].example} />
											</div>
										}
										trigger={'click'}
										title="example"
									>
										<Button type={'link'}>Example</Button>
									</Popover>
								)}
								<div style={{ margin: 4 }}>{entry[1].description}</div>
								<br />
							</div>
						))}
					</Drawer>
				</span>
			</span>
			<div ref={drop}>
				{editor === 'simple' ? (
					<Input.TextArea
						ref={(input) => {
							// console.log('simple ref', input);
							// refs.simple=input;
						}}
						onChange={(e) => handleChange(e.target.value)}
						value={code}
						autoSize
					/>
				) : editor === 'latex' ? (
					<Input.TextArea
						onChange={(e) => handleLatex(e.target.value)}
						value={preamble}
						autoSize
					/>
				) : (
					<AceEditor
						ref={refs.ace}
						mode="xml"
						theme="textmate"
						name={props.id}
						width="100%"
						style={{
							height: 'auto',
							border: 'solid 1px #ddd',
							borderRadius: '4px',
							overflow: 'auto',
							resize: 'vertical',
						}}
						maxLines={14}
						minLines={2}
						//onLoad={this.onLoad}
						onChange={handleChange}
						fontSize={14}
						showPrintMargin={true}
						showGutter={true}
						highlightActiveLine={true}
						value={code}
						editorProps={{ $blockScrolling: true }}
						setOptions={{
							enableBasicAutocompletion: false,
							enableLiveAutocompletion: false,
							enableSnippets: true,
							showLineNumbers: true,
							tabSize: 4,
							useWorker: false,
							wrap: true,
							indentedSoftWrap: false,
						}}
					/>
				)}
			</div>
			{!!code && editor !== 'simple' && (
				<XmlRender
					key={previewKey}
					enable={render}
					value={displayMessage}
					style={{
						height: 'auto',
						background: 'white',
						padding: '4px 11px',
						lineHeight: 1.5,
						borderRadius: '4px',
						overflow: 'auto',
						resize: 'vertical',
					}}
				/>
			)}
		</div>
	);
}

export default XmlEditor;

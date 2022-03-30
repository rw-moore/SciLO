import theme from '../../config/theme.json';
import XmlRender from '../Editor/XmlRender';
import { Button, Divider, Input, message, Skeleton, Tag } from 'antd';
import React, { useState } from 'react';
// import axios from "axios";
// import ErrorHandler from "../../networks/ErrorHandler";
import TraceResult from '../DecisionTree/TraceResult';
import TestDecisionTree from '../../networks/TestDecisionTree';

export default function DecisionTreeFrame(props) {
	const [result, setResult] = useState();
	const [value, setValue] = useState();
	const [loading, setLoading] = useState(false);

	const submit = () => {
		if (loading || !value) return;

		setResult(undefined);
		setLoading(true);
		const form = {
			input: value,
			tree: props.tree,
			full: false,
			args: {
				script:
					(props.script ? props.script + '\n' : '') +
					(props.data.type.script || ''),
			},
		};

		TestDecisionTree(form, props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Submit failed, see browser console for more details.'
				);
				setLoading(false);
				console.error(data);
			} else {
				setResult(data.data);
				setLoading(false);
			}
		});
	};

	return (
		<div
			style={{
				backgroundColor: theme['@white'],
				marginBottom: '12px',
				padding: '12px',
			}}
		>
			<div style={{ margin: 4 }}>
				<XmlRender style={{ border: undefined }}>
					{props.data.text}
				</XmlRender>
			</div>
			<Input
				addonBefore={props.data.type.label}
				value={value}
				disabled={loading}
				// addonAfter={<Button size={"small"} onClick={props.test || submit} type={"link"}>Test</Button>}
				onPressEnter={props.test || submit}
				onChange={(e) => {
					setValue(e.target.value);
					props.onChange && props.onChange(e);
				}}
			/>
			<Skeleton loading={loading} active>
				{!!result && (
					<div>
						<Divider orientation={'left'}>Result</Divider>
						Your score: <Tag color={'orange'}>{result.score}</Tag>
						<br />
						Your feedback:{' '}
						{result.feedback.map((f, i) => (
							<Tag key={i} color={'cyan'}>
								{f}
							</Tag>
						))}
						<br />
						Your Trace:
						<br />
						<TraceResult data={result.trace} />
						Timing:
						<blockquote>{result.time}</blockquote>
					</div>
				)}
			</Skeleton>
		</div>
	);
}

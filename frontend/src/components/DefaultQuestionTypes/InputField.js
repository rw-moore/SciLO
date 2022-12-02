import {
	CaretDownOutlined,
	CaretUpOutlined,
	DeleteOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import {
	Col,
	Collapse,
	Divider,
	Form,
	Input,
	InputNumber,
	Row,
	Select,
	Space,
	Switch,
	Tag,
	Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import XmlEditor from '../Editor/XmlEditor';

/**
 * Input field form template
 */
export default function InputField(props) {
	const {
		fetched,
		images,
		up,
		down,
		id,
		key,
		name,
		field,
		title,
		remove,
		changeIdentifier,
		helpIcon,
		...rest
	} = props;
	const responsePatterns = [
		{ type: 'Custom', pattern: '', flags: '' },
		{ type: 'Positive Integer', pattern: '^\\d*$', flags: 'g' },
		{ type: 'Integer', pattern: '^-?\\d*$', flags: 'g' },
		{
			type: 'Positive Real',
			pattern: '^\\d+\\.?\\d*(/\\d+\\.?\\d*)?$',
			flags: 'g',
		},
		{
			type: 'Real',
			pattern: '^-?\\d+\\.?\\d*(/\\d+\\.?\\d*)?$',
			flags: 'g',
		},
	];
	const [disablePattern, setDisablePattern] = useState(fetched.type?.patterntype !== 'Custom');
	const form = Form.useFormInstance();

	useEffect(() => {
		const pattType = form.getFieldValue(['responses', name, 'type', 'patterntype']);
		setDisablePattern(pattType !== 'Custom');
	}, [form, name]);

	const Panel = Collapse.Panel;

	// form layout css
	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 20 },
	};

	return (
		<Panel
			// extra props due to https://github.com/react-component/collapse/issues/73
			{...rest}
			style={{ height: props.isActive ? 'auto' : '3.5em' }}
			header={
				<span>
					<Tag onClick={up} style={{ marginLeft: 4 }}>
						<CaretUpOutlined />
					</Tag>
					<Tag onClick={down}>
						<CaretDownOutlined />
					</Tag>
					{title}
				</span>
			}
			key={key}
			extra={<DeleteOutlined onClick={remove} />}
			forceRender
		>
			{/*Text */}
			<Form.Item
				{...field}
				label="Text"
				tooltip={helpIcon(
					'This text will be shown beside the input box unless the box in embedded with <ibox/> in the question text. '
				)}
				{...formItemLayout}
				name={[name, 'text']}
				getValueProps={(value) => (value ? value.code : '')}
			>
				<XmlEditor initialValue={fetched.text} />
			</Form.Item>
			{/*Identifier */}
			<Form.Item
				{...field}
				label="Identifier"
				tooltip={helpIcon(
					"The student's answer to this input box will be assigned to a variable with this name during the decision tree"
				)}
				{...formItemLayout}
				name={[name, 'identifier']}
				validateTrigger={['onChange', 'onBlur']}
				rules={[
					{
						required: true,
						whitespace: true,
						message: 'Identifier cannot be empty.',
					},
					({ getFieldValue }) => ({
						vlidateTrigger: 'onChange',
						validator: (_, value) => {
							if (value) {
								let exists = false;
								for (const element of getFieldValue(`responses`)) {
									if (element.identifier === value) {
										if (exists) {
											return Promise.reject(
												new Error('All identifiers must be unique.')
											);
										}
										exists = true;
									}
								}
							}
							return Promise.resolve();
						},
					}),
					// prettier-ignore
					{
						validateTrigger: 'onBlur',
						validator: (_, value) => {
							changeIdentifier(value);
							return Promise.resolve();
						},
					},
				]}
				validateFirst={true}
			>
				<Input placeholder="Enter an identifier you want to refer to this response box with" />
			</Form.Item>
			{/*Proposed correct */}
			<Form.Item
				{...field}
				label="Proposed Correct Answer"
				tooltip={helpIcon(
					'Only used for filling correct answers while creating a question.'
				)}
				{...formItemLayout}
				name={[name, 'type', 'correct']}
			>
				<Input />
			</Form.Item>
			{/*Patterns titles */}
			<Row>
				<Col span={6}>
					{/*Response Pattern*/}
					<span>Response Pattern </span>
					<Tooltip title="" trigger="click">
						<QuestionCircleOutlined style={{ color: 'blue' }} />
					</Tooltip>
					<span>:</span>
				</Col>
				<Col span={12}>
					{/*Pattern*/}
					<span>Pattern </span>
					<Tooltip title="" trigger="click">
						<QuestionCircleOutlined style={{ color: 'blue' }} />
					</Tooltip>
					<span>:</span>
				</Col>
				<Col span={4}>
					{/*Patternflags */}
					<span>Patternflags </span>
					<Tooltip title="" trigger="click">
						<QuestionCircleOutlined style={{ color: 'blue' }} />
					</Tooltip>
					<span>:</span>
				</Col>
			</Row>
			{/*Patterns inputs */}
			<Row style={{ marginTop: 16 }}>
				<Col span={6}>
					<Form.Item {...field} name={[name, 'type', 'patterntype']} noStyle={true}>
						<Select
							onChange={(e) => {
								var patt = responsePatterns.find((val) => val.type === e);
								setDisablePattern(patt.type !== 'Custom');
								if (patt.type === 'Custom') {
									form.setFieldValue(
										['responses', name, 'type', 'pattern'],
										fetched.type.pattern || ''
									);
									form.setFieldValue(
										['responses', name, 'type', 'patternflag'],
										fetched.type.patternflag || ''
									);
								} else {
									form.setFieldValue(
										['responses', name, 'type', 'pattern'],
										patt.pattern
									);
									form.setFieldValue(
										['responses', name, 'type', 'patternflag'],
										patt.flags
									);
								}
							}}
						>
							{responsePatterns.map((patt) => (
								<Select.Option key={patt.type} value={patt.type}>
									{patt.type}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item {...field} name={[name, 'type', 'pattern']} noStyle={true}>
						<Input disabled={disablePattern} />
					</Form.Item>
				</Col>
				<Col span={4}>
					<Form.Item {...field} name={[name, 'type', 'patternflag']} noStyle={true}>
						<Input disabled={disablePattern} />
					</Form.Item>
				</Col>
			</Row>
			{/*Feedback title */}
			<Row style={{ marginTop: 24 }}>
				<Col span={16}>
					<span>Pattern Feedback </span>
					<Tooltip title="" trigger="">
						<QuestionCircleOutlined style={{ color: 'blue' }} />
					</Tooltip>
					<span>:</span>
				</Col>
			</Row>
			{/*Feedback input */}
			<Row style={{ marginTop: 16 }}>
				<Col span={16}>
					<Form.Item {...field} name={[name, 'type', 'patternfeedback']} noStyle={true}>
						<Input />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item
				{...field}
				name={[name, 'type', 'hasUnits']}
				label="Add Units"
				valuePropName="checked"
				tooltip={helpIcon('Adds an input box for units')}
			>
				<Switch />
			</Form.Item>

			<Divider />
			{/*Size & Label */}
			<Space align="start" style={{ justifyContent: 'flex-end', display: 'flex' }}>
				<Form.Item
					{...field}
					label="Size"
					tooltip={helpIcon('Width of the answer field')}
					name={[name, 'type', 'size']}
				>
					<InputNumber min={0} style={{ width: 88 }} />
				</Form.Item>
				<Form.Item
					{...field}
					label="Label"
					tooltip={helpIcon('Label of the answer field')}
					name={[name, 'type', 'label']}
				>
					<Input style={{ width: 88 }} />
				</Form.Item>
			</Space>
			<Form.Item {...field} hidden={true} noStyle={true} name={[name, 'type', 'name']}>
				<input />
			</Form.Item>
			<Form.Item {...field} hidden={true} noStyle={true} name={[name, 'id']}>
				<input />
			</Form.Item>
		</Panel>
	);
}

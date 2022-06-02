import { CaretDownOutlined, CaretUpOutlined, DeleteOutlined } from '@ant-design/icons';
import { Collapse, Divider, Form, Input, Select, Tag } from 'antd';
import React from 'react';
import XmlEditor from '../Editor/XmlEditor';
import { keyboards } from '../MathLive/customKeyboard';
const { Option } = Select;

/**
 * Input field form template
 */
export default function MathLiveField(props) {
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
	const form = Form.useFormInstance();

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
					'This text will be shown beside the input box unless the box in embedded with <something/> in the question text. '
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
				rules={[
					{
						required: true,
						whitespace: true,
						message: 'Identifier cannot be empty.',
					},
					({ getFieldValue }) => ({
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
					'Only used for filling correct answers while testing a question.'
				)}
				{...formItemLayout}
				name={[name, 'correct']}
			>
				<Input />
			</Form.Item>
			<Form.Item
				{...field}
				label="Allowed Keyboards"
				tooltip={helpIcon('Controls what keyboards will be shown to the student')}
				{...formItemLayout}
				name={[name, 'keyboards']}
			>
				<Select>
					{Object.entries(keyboards).map(([key, val]) => (
						<Option value={key} key={key}>
							{val.tooltip}
						</Option>
					))}
				</Select>
			</Form.Item>
			<Divider />
			<Form.Item {...field} hidden={true} noStyle={true} name={[name, 'type', 'name']}>
				<input />
			</Form.Item>
			<Form.Item {...field} hidden={true} noStyle={true} name={[name, 'id']}>
				<input />
			</Form.Item>
		</Panel>
	);
}

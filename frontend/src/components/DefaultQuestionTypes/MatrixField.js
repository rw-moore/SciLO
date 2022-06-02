import { CaretDownOutlined, CaretUpOutlined, DeleteOutlined } from '@ant-design/icons';
import { Collapse, Divider, Form, Input, InputNumber, Select, Space, Tag } from 'antd';
import React from 'react';
import XmlEditor from '../Editor/XmlEditor';

const { Panel } = Collapse;
const { Option } = Select;
/**
 * Input field form template
 */
export default function MatrixField(props) {
	// form layout css
	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 20 },
	};


	return (
		<Panel
			// extra props due to https://github.com/react-component/collapse/issues/73
			accordion={props.accordion}
			collapsible={props.collapsible}
			destroyInactivePanel={props.destroyInactivePanel}
			expandIcon={props.expandIcon}
			isActive={props.isActive}
			onItemClick={props.onItemClick}
			openMotion={props.openMotion}
			panelKey={props.panelKey}
			prefixCls={props.prefixCls}
			style={{ height: props.isActive ? 'auto' : '3.5em' }}
			header={
				<span>
					<Tag onClick={props.up} style={{ marginLeft: 4 }}>
						<CaretUpOutlined />
					</Tag>
					<Tag onClick={props.down}>
						<CaretDownOutlined />
					</Tag>
					{props.title}
				</span>
			}
			key={props.id}
			extra={<DeleteOutlined onClick={props.remove} />}
			forceRender
		>
			{/*Text */}
			<Form.Item
				{...props.field}
				label="Text"
				tooltip={props.helpIcon(
					'This text will be shown beside the input box unless the box in embedded with <ibox/> in the question text. '
				)}
				{...formItemLayout}
				name={[props.name, 'text']}
				getValueProps={(value) => (value ? value.code : '')}
			>
				<XmlEditor initialValue={props.fetched.text} />
			</Form.Item>
			{/*Identifier */}
			<Form.Item
				{...props.field}
				label="Identifier"
				tooltip={props.helpIcon(
					"The student's answer to this input box will be assigned to a variable with this name during the decision tree"
				)}
				{...formItemLayout}
				name={[props.name, 'identifier']}
				rules={[
					{
						required: true,
						whitespace: true,
						message: 'Identifier cannot be empty.',
					},
					({ getFieldValue }) => ({
						validator(_, value) {
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
					{
						validator: (_, value) => {
							props.changeIdentifier(value);
							return Promise.resolve();
						},
					},
				]}
				validateFirst={true}
			>
				<Input placeholder="Enter an identifier you want to refer to this response box with" />
			</Form.Item>
			<Form.Item
				{...props.field}
				label="Rows"
				tooltip={props.helpIcon('The number of rows the matrix field should have.')}
				{...formItemLayout}
				name={[props.name, 'type', 'rows']}
				rules={[
					{
						required: true,
						message: 'Number of rows cannot be empty.',
					},
				]}
			>
				<InputNumber min={1} />
			</Form.Item>
			<Form.Item
				{...props.field}
				label="Columns"
				tooltip={props.helpIcon('The number of columns the matrix field should have.')}
				{...formItemLayout}
				name={[props.name, 'type', 'columns']}
				rules={[
					{
						required: true,
						message: 'Number of columns cannot be empty.',
					},
				]}
			>
				<InputNumber min={1} />
			</Form.Item>
			<Form.Item
				{...props.field}
				label="Display as"
				tooltip={props.helpIcon(
					'Should this be displayed with the vector or column delimiters.'
				)}
				{...formItemLayout}
				name={[props.name, 'type', 'display']}
				rules={[
					{
						required: true,
						message: 'Must select which delimiters to follow',
					},
				]}
			>
				<Select>
					<Option value="matrix">Matrix</Option>
					<Option value="vector">Vector</Option>
				</Select>
			</Form.Item>
			<Divider />
			{/*Size */}
			<Space align="start" style={{ justifyContent: 'flex-end', display: 'flex' }}>
				<Form.Item
					{...props.field}
					label="Size"
					tooltip={props.helpIcon('Width of each answer field')}
					name={[props.name, 'type', 'size']}
				>
					<InputNumber min={0} style={{ width: 88 }} />
				</Form.Item>
			</Space>
			<Form.Item
				{...props.field}
				hidden={true}
				noStyle={true}
				name={[props.name, 'type', 'name']}
			>
				<input />
			</Form.Item>
			<Form.Item {...props.field} hidden={true} noStyle={true} name={[props.name, 'id']}>
				<input />
			</Form.Item>
		</Panel>
	);
}

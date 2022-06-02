import React from 'react';
import {
	CaretDownOutlined,
	CaretUpOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import {
	Button,
	Collapse,
	Divider,
	Form,
	Input,
	Select,
	Switch,
	Tag,
	Tooltip,
} from 'antd';
import { CodeEditor } from '../CodeEditor';

const languages = [
	'sage',
	'gap',
	'gp',
	'html',
	'maxima',
	'octave',
	'python',
	'r',
	'singular',
];

export default class SagePlayground extends React.Component {
	state = {
		// value: this.props.fetched?this.props.fetched.type.code:undefined
	};

	render() {
		const { TextArea } = Input;
		const Panel = Collapse.Panel;

		// form layout css
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
		};
		return (
			<Panel
				// extra props due to https://github.com/react-component/collapse/issues/73
				accordion={this.props.accordion}
				collapsible={this.props.collapsible}
				destroyInactivePanel={this.props.destroyInactivePanel}
				expandIcon={this.props.expandIcon}
				isActive={this.props.isActive}
				onItemClick={this.props.onItemClick}
				openMotion={this.props.openMotion}
				panelKey={this.props.panelKey}
				prefixCls={this.props.prefixCls}
				style={{ marginBottom: 12 }}
				header={
					<span>
						<Tag onClick={this.props.up} style={{ marginLeft: 4 }}>
							<CaretUpOutlined />
						</Tag>
						<Tag onClick={this.props.down}>
							<CaretDownOutlined />
						</Tag>
						{this.props.title}
					</span>
				}
				key={this.props.id}
				extra={<DeleteOutlined onClick={this.props.remove} />}
				forceRender
			>
				<div>
					<Form.Item
						label="Text"
						{...formItemLayout}
						name={['responses', this.props.index, 'text']}
					>
						<TextArea
							autosize={{ minRows: 2, maxRows: 6 }}
							placeholder="Description of this response"
						/>
					</Form.Item>

					<Form.Item
						label="Identifier"
						{...formItemLayout}
						name={['responses', this.props.index, 'identifier']}
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
										for (const element of getFieldValue(
											`responses`
										)) {
											if (element.identifier === value) {
												if (exists) {
													return Promise.reject(
														new Error(
															'All identifiers must be unique.'
														)
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
									this.props.changeIdentifier(value);
									return Promise.resolve();
								},
							},
						]}
						validateFirst={true}
					>
						<Input placeholder="Enter an identifier you want to refer to this response box with" />
					</Form.Item>

					<Form.Item
						label="Language"
						{...formItemLayout}
						name={[
							'responses',
							this.props.index,
							'type',
							'language',
						]}
					>
						<Select
							placeholder="Select language"
							style={{ width: '100%' }}
							onChange={(value) => this.setState({ lang: value })}
						>
							{languages.map((d) => (
								<Select.Option key={d}>{d}</Select.Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Codes"
						{...formItemLayout}
						name={['responses', this.props.index, 'type', 'code']}
					>
						<CodeEditor
							language={this.state.lang}
							initValue={
								this.props.fetched.type
									? this.props.fetched.type.code
									: undefined
							}
							value={this.state.script}
							onChange={(value) =>
								this.setState({ script: value })
							}
						/>
					</Form.Item>

					<Divider>
						Advanced Settings
						<Button
							type={'link'}
							onClick={() =>
								this.setState({
									showAdvancedSettings:
										!this.state.showAdvancedSettings,
								})
							}
						>
							{this.state.showAdvancedSettings ? 'hide' : 'show'}
						</Button>
					</Divider>

					<div hidden={!this.state.showAdvancedSettings}>
						<Form.Item
							label="Server"
							{...formItemLayout}
							name={[
								'responses',
								this.props.index,
								'type',
								'src',
							]}
							preserve={true}
						>
							<Input placeholder="Leave empty to use default server." />
						</Form.Item>

						<Form.Item
							label="Hidden"
							{...formItemLayout}
							name={[
								'responses',
								this.props.index,
								'type',
								'params',
								'hide',
							]}
							preserve={true}
						>
							<Select
								mode={'multiple'}
								placeholder="Select parts to hide"
								style={{ width: '100%' }}
							>
								{[
									'editor',
									'fullScreen',
									'language',
									'evalButton',
									'permalink',
									'output',
									'done',
									'sessionFiles',
									'messages',
									'sessionTitle',
								].map((d) => (
									<Select.Option key={d}>{d}</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							label="Button Text"
							{...formItemLayout}
							name={[
								'responses',
								this.props.index,
								'type',
								'params',
								'evalButtonText',
							]}
							preserve={true}
						>
							<Input />
						</Form.Item>

						<Divider />
						<Tooltip
							title="This sets whether subsequent session output (future Sage cell evaluations) should replace or be displayed alongside current session output"
							arrowPointAtCenter
						>
							<Tag>Replace Output</Tag>
							<Form.Item
								noStyle={true}
								name={[
									'responses',
									this.props.index,
									'type',
									'params',
									'replaceOutput',
								]}
								preserve={true}
								valuePropName={'checked'}
							>
								<Switch />
							</Form.Item>
						</Tooltip>
						<Divider type="vertical" />
						<Tooltip
							title="This sets whether the code from the code option will be immediately evaluated, without the need for pressing a button. Caution! Please use this option sparingly, especially with @interact, to decrease the load on servers. Unless majority of users who open your page are likely to use this cell, let them press a button to trigger evaluation."
							arrowPointAtCenter
						>
							<Tag>Auto Eval</Tag>
							<Form.Item
								noStyle={true}
								name={[
									'responses',
									this.props.index,
									'type',
									'params',
									'autoeval',
								]}
								preserve={true}
								valuePropName={'checked'}
							>
								<Switch />
							</Form.Item>
						</Tooltip>
						<Divider type="vertical" />
						<Tooltip
							title="This sets whether the code from the Question Script will be prepended to this code before evaluation. Caution! make sure the scripts are using the same language."
							arrowPointAtCenter
						>
							<Tag>Inherit Script</Tag>
							<Form.Item
								noStyle={true}
								name={[
									'responses',
									this.props.index,
									'type',
									'inheritScript',
								]}
								preserve={true}
								valuePropName={'checked'}
							>
								<Switch />
							</Form.Item>
						</Tooltip>
					</div>
					<span hidden={true}>
						<Form.Item
							noStyle={true}
							name={[
								'responses',
								this.props.index,
								'type',
								'name',
							]}
						>
							<input />
						</Form.Item>
						<Form.Item
							noStyle={true}
							name={['responses', this.props.index, 'mark']}
						>
							<input />
						</Form.Item>
						<Form.Item
							noStyle={true}
							name={['responses', this.props.index, 'id']}
						>
							<input />
						</Form.Item>
					</span>
				</div>
			</Panel>
		);
	}
}

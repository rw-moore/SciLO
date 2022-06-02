import {
	CaretDownOutlined,
	CaretUpOutlined,
	DeleteOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Collapse,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Space,
	Switch,
	Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import theme from '../../config/theme';
import randomID from '../../utils/RandomID';
import XmlEditor from '../Editor/XmlEditor';

/**
 * Multiple Choice form template
 */
export default function MultipleChoice(props) {
	const [response, setResponse] = useState(() => {
		const response = Object.keys(props.fetched).length ? props.fetched : { answers: [] };
		response.answers = (response.answers??[]).map((ans) => ({
			...ans,
			uid: randomID(),
		}));
		// console.log('construct', response.answers);
		return response;
	});
	const form = Form.useFormInstance();
	const updateResponseState = (response, cb = () => {}) => {
		response.answers = response.answers.map((ans) => ({
			...ans,
			uid: randomID(),
		}));
		setResponse(response);
		cb();
	};
	useEffect(() => {
		form.validateFields([['responses', props.name, 'answers']])
			.then((values) => {
				//console.log('mount', values);
			})
			.catch((err) => {
				console.error('mount', err);
			});
	}, [form, props.name]);

	/* remove an answer */
	const removeState = (i) => {
		// filter out the answer we do not want
		// console.log('remove', i);
		const responses = form.getFieldValue('responses');
		responses[props.name].answers.splice(i, 1);
		// console.log(responses);
		updateResponseState(responses[props.name], () => props.changeOrder(responses));
		// re-order the answers
	};

	/* add an answer */
	const addState = () => {
		const responses = form.getFieldValue('responses');
		responses[props.name].answers.push({ uid: randomID(), grade: 0 });
		updateResponseState(responses[props.name], () => props.changeOrder(responses));
	};

	/* happen when the user has done dragging of the answer card */
	const onDragEnd = (result) => {
		// a little function to help us with reordering the result
		const reorder = (list, startIndex, endIndex) => {
			const result = Array.from(list);
			const [removed] = result.splice(startIndex, 1);
			result.splice(endIndex, 0, removed);
			return result;
		};
		// dropped outside the list
		if (!result.destination) {
			return;
		}
		const old_fields = form.getFieldValue(['responses', props.name, 'answers']);
		// console.log('drag end', old_fields);
		const new_fields = reorder(old_fields, result.source.index, result.destination.index);
		// console.log(new_fields);
		const responses = form.getFieldValue('responses');
		responses[props.name].answers = new_fields;
		updateResponseState(responses[props.name], () => props.changeOrder(responses));
		// re-order the answers
	};

	const getColor = (index) => {
		let grade = form.getFieldValue([`responses`, props.name, `answers`, index, `grade`]);
		let max = form.getFieldValue([`responses`, props.name, `mark`]);
		if (grade >= max) {
			return 'green';
		} else if (grade > 0) {
			return 'orange';
		} else {
			return 'magenta';
		}
	};

	const gradeValidator = (formInstance) => {
		const validator = (_, _value) => {
			// console.log('validator', _value);
			let single = formInstance.getFieldValue([`responses`, props.name, `type`, `single`]);
			// console.log('single', single);
			let max = 0;
			let sum = 0;
			formInstance.getFieldValue(['responses', props.name, 'answers']).forEach((k, i) => {
				console.log('answer', k);
				let grade = k.grade;
				// console.log('grade '+k, grade);
				if (typeof grade === 'string') {
					grade = Number(grade.replace('%', ''));
				}
				if (grade > 0) {
					sum += grade;
				}
				if (grade > max) {
					max = grade;
				}
			});
			const trueMax = formInstance.getFieldValue([`responses`, props.name, `mark`]);
			// console.log(max, sum);
			if (single && max < trueMax) {
				return Promise.reject(new Error("You can't achieve 100% on this question."));
			} else if (single && max > trueMax) {
				return Promise.reject(
					new Error('You can achieve more than 100% on this question.')
				);
			} else if (!single && sum < trueMax) {
				return Promise.reject(new Error("You can't achieve 100% on this question."));
			} else if (!single && sum > trueMax) {
				return Promise.reject(
					new Error('You can achieve more than 100% on this question.')
				);
			}
			return Promise.resolve();
		};
		return {
			validator,
		};
	};

	const answerIdentifierValidator = ({ getFieldValue }) => {
		const validator = (_, value) => {
			if (value) {
				let exists = false;
				for (const element of getFieldValue([`responses`, props.name, 'answers'])) {
					if (element.identifier === value) {
						if (exists) {
							return Promise.reject(
								new Error('All identifiers for this field must be unique.')
							);
						}
						exists = true;
					}
				}
			}
			return Promise.resolve();
		};
		return {
			validator,
		};
	};

	const Panel = Collapse.Panel;

	// form layout css
	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 20 },
	};

	// render the answer cards
	const renderAnswers = (answerFields, remove) => {
		return answerFields.map(({ key, name, ...restFields }) => {
			const renderkey = response.answers[name]?.uid ?? randomID();
			return (
				// k is the unique id of the answer which created in add()
				<Draggable key={'drag_' + renderkey} draggableId={'drag_' + renderkey} index={name}>
					{(provided, snapshot) => (
						<div key={renderkey} {...provided.draggableProps} ref={provided.innerRef}>
							<Card
								size={'small'}
								bordered={snapshot.isDragging}
								style={{
									backgroundColor: snapshot.isDragging
										? 'white'
										: theme['@white'],
								}}
								{...provided.dragHandleProps}
							>
								<Form.Item
									{...restFields}
									{...formItemLayout}
									label={
										<Tag
											key={renderkey}
											closable
											onClose={() => {
												removeState(name);
												remove(name);
											}}
											color={getColor(name)}
										>
											{'Choice ' + (name + 1)}
										</Tag>
									}
									tooltip={props.helpIcon('')}
									required={false}
									key={renderkey}
									name={[name, 'text']}
									getValueProps={(value) => {
										/*console.log('gvp',index, value);*/ return value
											? value.code
											: '';
									}}
									rules={[
										{
											required: true,
											message: 'Cannot have empty body choice.',
										},
									]}
								>
									<XmlEditor initialValue={response.answers[name]?.text ?? ''} />
								</Form.Item>
								<Form.Item
									{...restFields}
									{...formItemLayout}
									label="Feedback"
									tooltip={props.helpIcon('')}
									name={[name, 'comment']}
								>
									<Input />
								</Form.Item>
								<Form.Item
									{...restFields}
									label="Identifier"
									tooltip={props.helpIcon('')}
									{...formItemLayout}
									name={[name, 'identifier']}
									rules={[answerIdentifierValidator]}
								>
									<Input placeholder="Enter an identifier to represent this answer in the script (text will be used if blank)" />
								</Form.Item>
								<Form.Item
									{...restFields}
									{...formItemLayout}
									label="Grade"
									tooltip={props.helpIcon('')}
									name={[name, 'grade']}
									dependencies={[
										['responses', props.name, 'type', 'single'],
										['responses', props.name, 'mark'],
										...response.answers
											.map((el, i) => {
												if (i !== name) {
													return [
														'responses',
														props.name,
														'answers',
														i,
														'grade',
													];
												}
												return null;
											})
											.filter((a) => a !== null),
									]}
									rules={[
										gradeValidator,
										{
											required: true,
											message: 'This is a required field.',
										},
									]}
								>
									<InputNumber />
								</Form.Item>
							</Card>
						</div>
					)}
				</Draggable>
			);
		});
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
			extra={
				<DeleteOutlined
					onClick={() => {
						Modal.confirm({
							title: 'Delete',
							content: (
								<span>
									Do you want to delete this field? It will delete any associated
									nodes and <span style={{ color: 'red' }}>their children</span>{' '}
									as well.
								</span>
							),
							onOk: props.remove,
						});
					}}
				/>
			}
			forceRender
		>
			<DragDropContext onDragEnd={onDragEnd}>
				<Form.Item
					{...props.field}
					label="Text"
					tooltip={props.helpIcon('')}
					{...formItemLayout}
					name={[props.name, 'text']}
					getValueProps={(value) => (value ? value.code : '')}
				>
					<XmlEditor initialValue={response.text} />
				</Form.Item>
				<Form.Item
					{...props.field}
					label="Identifier"
					tooltip={props.helpIcon('')}
					{...formItemLayout}
					name={[props.name, 'identifier']}
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
								props.changeIdentifier(value);
								return Promise.resolve();
							},
						},
					]}
					validateFirst={true}
				>
					<Input placeholder="Enter an identifier you want to refer to this response box with" />
				</Form.Item>
				<Form.List name={[props.name, 'answers']}>
					{(answers, { remove }) => (
						<>
							<Droppable droppableId={'drop_' + props.id}>
								{(provided) => (
									<div {...provided.droppableProps} ref={provided.innerRef}>
										{renderAnswers(answers, remove)}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
							{answers.length !== 0 && <Divider />}
							<Button
								type="default"
								icon={<PlusOutlined />}
								onClick={() => {
									addState();
								}}
							>
								Add choice
							</Button>
						</>
					)}
				</Form.List>
				<Space align="start" style={{ float: 'right' }}>
					<Form.Item
						{...props.field}
						label={'Shufflable'}
						tooltip={props.helpIcon('Should ever shuffle the choices?')}
						name={[props.name, 'type', 'shuffle']}
						valuePropName={'checked'}
					>
						<Switch size={'small'} />
					</Form.Item>
					<Form.Item
						{...props.field}
						label={'Single'}
						tooltip={props.helpIcon('Multiple correct answers?')}
						name={[props.name, 'type', 'single']}
						valuePropName={'checked'}
					>
						<Switch size={'small'} />
					</Form.Item>
					<Form.Item
						{...props.field}
						label={'Dropdown'}
						tooltip={props.helpIcon(
							'Use a dropdown menu for rendering (useful when having many options)'
						)}
						name={[props.name, 'type', 'dropdown']}
						valuePropName={'checked'}
					>
						<Switch size={'small'} />
					</Form.Item>
					<Form.Item
						{...props.field}
						label={'Mark'}
						tooltip={props.helpIcon('')}
						name={[props.name, 'mark']}
					>
						<InputNumber size="default" min={0} max={100000} />
					</Form.Item>
				</Space>
				{/* storing meta data*/}
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
			</DragDropContext>
		</Panel>
	);
}

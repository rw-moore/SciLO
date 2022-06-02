import {
	DeleteOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Collapse,
	Divider,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Radio,
	Row,
	Select,
	Switch,
	Tooltip,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHistory } from 'react-router-dom';
import theme from '../../config/theme';
import PostQuestion from '../../networks/PostQuestion';
import PutQuestion from '../../networks/PutQuestion';
import PutQuestionImages from '../../networks/PutQuestionImages';
import randomID from '../../utils/RandomID';
import { CodeEditor } from '../CodeEditor';
import DecisionTree, { calculateMark } from '../DecisionTree/index';
import InputField from '../DefaultQuestionTypes/InputField';
import MathLiveField from '../DefaultQuestionTypes/MathliveInput';
import MatrixField from '../DefaultQuestionTypes/MatrixField';
import MultipleChoice from '../DefaultQuestionTypes/MultipleChoice';
import SagePlayground from '../DefaultQuestionTypes/SagePlayground';
import XmlEditor from '../Editor/XmlEditor';
import XmlRender from '../Editor/XmlRender';
import GetCourseSelectBar from './GetCourseSelectBar';
import GetTagsSelectBar from './GetTagsSelectBar';
import QuestionImages from './QuestionImages';

const timeFormat = 'YYYY-MM-DD HH:mm:ss';
const { Option } = Select;
/**
 * Create/modify a question
 */
function CreateQuestionForm(props) {
	const [form] = Form.useForm();
	let history = useHistory();
	return <CreateQuestionFormF {...props} form={form} history={history} />;
}
export default CreateQuestionForm;
class CreateQuestionFormF extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			desc_as_title: props.question?.desc_as_title ?? false,
			typeOfResponseToAdd: undefined,
			script: props.question?.variables?.value ?? undefined,
			language: props.question?.variables?.language ?? 'sage',
			tree: props.question?.tree ?? {},
			mark: props.question?.mark ?? 0,
			triesWarning: props.question?.grade_policy?.max_tries === 0 || false,
			no_deduction: props.question?.grade_policy?.penalty_per_try === 0 || false,
			responses:
				props.question?.responses?.map?.((response) => ({
					...response,
					key: response.id.toString(),
					answerOrder: Object.keys(response.answers),
				})) ?? [],
			images: props.images || [],
			activeKeys: [],
		};
		this.defaults = {
			descriptor: props.question?.descriptor,
			title: props.question?.title,
			desc_as_title: props.question?.desc_as_title,
			text: props.question?.text,
			solution: props.question?.solution,
			grade_policy: {
				max_tries: props.question?.grade_policy?.max_tries ?? 1,
				penalty_per_try: props.question?.grade_policy?.penalty_per_try ?? 0,
				free_tries: props.question?.grade_policy?.free_tries ?? 1,
			},
			options: {
				matrix_delimiters: props.question?.options?.matrix_delimiters ?? 'parenthesis',
				vector_delimiters: props.question?.options?.vector_delimiters ?? 'parenthesis',
			},
			responses: [],
			tags: (props.question?.tags ?? []).map((tag) => tag.name),
			course: props.question?.id
				? props.question.course
					? `${props.question.course}`
					: undefined
				: props.course
				? `${props.course}`
				: undefined,
		};
		(props.question?.responses ?? []).forEach((k, index) => {
			console.log(k, index);
			switch (k.type.name) {
				case 'multiple':
					// console.log('mult choice formitems', k);
					this.defaults.responses[index] = {
						answers: k?.answers ?? [],
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						mark: k?.mark ?? 1,
						type: {
							shuffle: k.type?.shuffle ?? true,
							single: k.type?.single ?? true,
							dropdown: k.type?.dropdown ?? false,
							name: 'multiple',
						},
						id: k?.id,
					};
					break;
				case 'tree':
					this.defaults.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						patterntype: k?.patterntype ?? 'Custom',
						pattern: k?.pattern ?? '',
						patternflag: k?.patternflag ?? '',
						patternfeedback: k?.patternfeedback ?? '',
						correct: k?.correct ?? '',
						type: {
							label: k?.type?.label ?? 'Answer',
							size: k?.type?.size ?? 5,
							name: 'tree',
						},
						id: k?.id,
					};
					break;
				case 'algebraic':
					this.defaults.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						type: {
							name: 'algebraic',
						},
						id: k?.id,
					};
					break;
				case 'matrix':
					this.defaults.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						type: {
							rows: k?.type?.rows ?? 1,
							columns: k?.type?.columns ?? 1,
							size: k?.type?.size ?? 5,
							display: k?.type?.display ?? 'matrix',
							name: 'matrix',
						},
						id: k?.id,
					};
					break;
				case 'sagecell':
					this.defaults.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						type: {
							language: k?.type?.language ?? undefined,
							code: k?.type?.code ?? undefined,
							src: k?.type?.src ?? undefined,
							params: {
								hide: k?.type?.params?.hide ?? [
									'editor',
									'fullScreen',
									'language',
									'evalButton',
									'permalink',
									'done',
									'sessionFiles',
									'messages',
									'sessionTitle',
								],
								evalButtonText: k?.type?.params?.evalButtonText ?? 'Evaluate',
								replaceOutput: k?.type?.params?.replaceOutput ?? true,
								autoeval: k?.type?.params?.autoeval ?? true,
							},
							inheritScript: k.type?.inheritScript ?? false,
							name: 'sagecell',
						},
						mark: k?.mark,
						id: k?.id,
					};
					break;
				default:
			}
		});
		console.log('defaults', this.defaults);
	}

	/* remove a response with id:k */
	remove = (k) => {
		// can use data-binding to get
		let responses = this.state.responses;
		let idx = responses.findIndex((r) => r.key === k);
		let resp = responses.splice(idx, 1)[0];
		let tree = this.state.tree;
		// console.log(resp);
		if (resp.type.name === 'multiple') {
			const removeNode = function (tree, ident) {
				if (tree.children) {
					for (var i = tree.children.length - 1; i >= 0; i--) {
						if (tree.children[i].identifier === ident) {
							tree.children.splice(i, 1);
						} else {
							tree.children[i] = removeNode(tree.children[i], ident);
						}
					}
				}
				return tree;
			};
			tree = removeNode(tree, resp.identifier);
		}
		this.setState({
			tree,
			responses,
		});
	};

	/* add a new response */
	add = (add_func) => {
		const responses = this.state.responses;

		const nextKeys = responses.concat({
			key: randomID(),
			type: { name: this.state.typeOfResponseToAdd },
			answerOrder: [],
		});
		const newResp = this.state.typeOfResponseToAdd;
		let newData = {};
		this.setState({ responses: nextKeys });
		if (newResp === 'tree') {
			newData = {
				text: '',
				identifier: '',
				patterntype: 'Custom',
				pattern: '',
				patternflag: '',
				patternfeedback: '',
				type: {
					label: 'Answer',
					name: 'tree',
				},
			};
		} else if (newResp === 'algebraic') {
			newData = {
				text: '',
				identifier: '',
				type: {
					name: 'algebraic',
				},
			};
		} else if (newResp === 'multiple') {
			newData = {
				answers: [],
				text: '',
				identifier: '',
				mark: 1,
				type: {
					shuffle: true,
					single: true,
					dropdown: false,
					name: 'multiple',
				},
			};
		} else if (newResp === 'sagecell') {
			newData = {
				text: '',
				identifier: '',
				type: {
					language: undefined,
					code: undefined,
					src: undefined,
					params: {
						hide: [
							'editor',
							'fullScreen',
							'language',
							'evalButton',
							'permalink',
							'done',
							'sessionFiles',
							'messages',
							'sessionTitle',
						],
						evalButtonText: 'Evaluate',
						replaceOutput: true,
						autoeval: true,
					},
					inheritScript: false,
					name: 'sagecell',
				},
				mark: 0,
			};
		} else if (newResp === 'matrix') {
			newData = {
				text: '',
				identifier: '',
				type: {
					rows: 1,
					columns: 1,
					display: 'matrix',
					size: 5,
					name: 'matrix',
				},
			};
		}
		console.log('add', newData);
		add_func(newData);
	};

	/* swap two responses order with id i and j */
	swap = (i, j) => {
		// console.log('swap');
		const responses = this.state.responses;
		if (j < 0 || j >= responses.length) {
			return;
		}
		[responses[i], responses[j]] = [responses[j], responses[i]];
		this.setState({ responses });
	};

	/* change order of the answers in the response with id:k */
	changeOrder = (k, new_responses, cb) => {
		// console.log('change order');
		let responses = this.state.responses;
		let index;
		responses.forEach((r, i) => {
			if (r.key === k) {
				r.answerOrder = Object.keys(new_responses[i].answers);
				index = i;
			}
		});
		this.setState(
			{
				responses,
			},
			() => {
				this.props.form.setFieldsValue(new_responses);
				this.props.form
					.validateFields([['responses', index, 'answers']])
					.then((values) => {
						console.log('changeOrder', values);
					})
					.catch((err) => {
						console.error('changeOrder', err);
					});
			}
		);
	};

	/* change identifier in state so the tree can find it */
	changeIdentifier = (k, newIdentifier) => {
		// console.log('change ident');
		let responses = this.state.responses;
		let resp = responses.find((r) => r.key === k);
		let oldIdentifier = resp.identifier;
		resp.identifier = newIdentifier;
		if (resp.type.name === 'multiple') {
			let tree = this.state.tree;
			const updateTree = function (tree, oldId, newId) {
				if (tree.children) {
					for (var i = tree.children.length - 1; i >= 0; i--) {
						if (tree.children[i].identifier === oldId) {
							tree.children[i].identifier = newId;
						} else {
							tree.children[i] = updateTree(tree.children[i], oldId, newId);
						}
					}
				}
				return tree;
			};
			tree = updateTree(tree, oldIdentifier, newIdentifier);
			this.setState({ tree });
		}
		this.setState({
			responses: responses,
		});
	};

	afterSubmitQuestion = (data, returnToQB) => {
		if (!data || data.status !== 200) {
			message.error('Submit failed, see browser console for more details.');
			console.error(data);
		} else {
			//PUT images to /api/questions/{data.question.id}/images
			// console.log('after', data);
			// console.log(this.state.images);
			PutQuestionImages(data.data.question.id, this.state.images, this.props.token).then(
				(image_data) => {
					if (!image_data || image_data.status !== 200) {
						message.error(
							'Image submission failed, see browser console for more details.'
						);
						console.error(image_data);
					} else {
						if (returnToQB) {
							this.props.goBack();
						} else {
							message.success('Question was saved successfully.');
							this.props.fetch(() => {
								const responses = this.props.question.responses;

								responses.forEach((resp) => {
									resp.key = resp.id.toString();
									resp.answerOrder = Object.keys(resp.answers);
								});
								this.setState({
									responses: responses,
								});
								this.props.form.setFieldsValue({
									tags: this.props.question.tags.map((tag) => tag.name),
								});
							});
						}
					}
				}
			);
		}
	};

	confirmSubmit = (values, returnToQB) => {
		if (this.props.question?.id) {
			PutQuestion(this.props.question.id, values, this.props.token).then((data) =>
				this.afterSubmitQuestion(data, returnToQB)
			);
		} else {
			values.create_date = moment().format(timeFormat);
			PostQuestion(values, this.props.token).then((data) =>
				this.afterSubmitQuestion(data, returnToQB)
			);
		}
	};

	/* triggered when the submit button is clicked */
	handleSubmit = (e, returnToQB) => {
		e.preventDefault();
		this.props.form
			.validateFields()
			.then((values) => {
				values.variables = {
					type: 'script',
					language: this.state.language || 'sage',
					value: this.state.script || '',
				};
				values.tree = this.state.tree || {};
				values.tree.name = 'tree';
				values.tags = this.parseTags(values.tags);
				values.responses = this.sortResponses(values.responses);
				values.last_modify_date = moment().format(timeFormat);
				console.log('Received values of form: ', values);
				// console.log("Json", JSON.stringify(values));
				const total_mark = calculateMark(
					this.state.tree,
					values.responses.reduce(function (map, obj) {
						map[obj.identifier] = obj;
						return map;
					}, {}),
					this.props.form
				);
				if (
					((total_mark.true && total_mark.true.max <= 0) || total_mark.max <= 0) &&
					returnToQB
				) {
					Modal.confirm({
						title: 'Are you sure you want to finish?',
						icon: <ExclamationCircleOutlined />,
						content:
							'The maximum score achievable on this question is 0. Are you sure your want to proceed?',
						okText: 'Yes',
						onOk: () => {
							this.confirmSubmit(values, returnToQB);
						},
					});
				} else {
					this.confirmSubmit(values, returnToQB);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	/* triggered when the preview button is clicked */
	handlePreview = (e) => {
		e.preventDefault();
		this.props.form
			.validateFields()
			.then((values) => {
				values.variables = {
					type: 'script',
					language: this.state.language || 'sage',
					value: this.state.script || '',
				};
				values.tree = this.state.tree || {};
				values.tree.name = 'tree';
				values.tags = this.parseTags(values.tags);
				values.responses = this.sortResponses(values.responses);
				console.log('Received values of form: ', values);
				// console.log("Json", JSON.stringify(values));
				this.props.updatePreview(values, this.state.images);
				return values;
			})
			.catch((err) => {
				console.error(err);
			});
	};

	/* OnChange function of selection in the add a response modal */
	onSelectComponentChange = (e) => {
		this.setState({
			typeOfResponseToAdd: e,
		});
	};

	/* render function of adding a response */
	addComponent = (add_func) => {
		const Option = Select.Option;

		// select component which is used to choose a response type
		const group = (
			<Select
				onChange={this.onSelectComponentChange}
				style={{ width: 200 }}
				placeholder="Select a template"
				optionFilterProp="children"
				filterOption={(input, option) =>
					option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
			>
				<Option value="tree">Input Field</Option>
				<Option value="algebraic">Algebraic Field</Option>
				<Option value="multiple">Multiple Choice</Option>
				<Option value="matrix">Matrix/Vector Field</Option>
				{/* <Option value="sagecell">SageCell Embedded</Option> */}
				<Option value="custom">Custom Templates</Option>
			</Select>
		);

		// show the modal
		this.addModal = Modal.confirm({
			title: 'Add Response',
			content: group,
			okText: 'OK',
			cancelText: 'Cancel',
			onOk: () => {
				this.addModal.destroy();
				this.add(add_func);
			},
		});
	};

	/* post processing of the tags information */
	parseTags = (tags) => {
		if (tags) {
			return tags.map((tag) => ({ name: tag.trim() }));
		}
	};

	/* sort the responses by their ids matching the order */
	sortResponses = (responses) => {
		// console.log('sortresp', responses);
		// console.log(this.state.responses);
		// const index = (key) => {
		//     const arr = this.state.responses.map(item => item.index);
		//     return arr.indexOf(key)
		// };

		if (!responses) {
			return [];
		}
		// console.log('sort passed');
		responses = Object.entries(responses);
		responses.forEach((item) => {
			// console.log('sort mid1', item);
			if (!item[1].answers) {
				return;
			}
			// console.log('sort mid');
			const answerIndex = (answerID) =>
				this.state.responses[item[0]].answerOrder.indexOf(answerID);
			item[1].answers = Object.entries(item[1].answers);
			item[1].answers.sort((a, b) => (answerIndex(a[0]) > answerIndex(b[0]) ? 1 : -1));
			item[1].answers = item[1].answers.map((item) => item[1]);
			// console.log('sort mid end');
		});
		responses.sort((a, b) => (a[0] > b[0] ? 1 : -1));
		let out = responses.map((item) => item[1]);
		// console.log('sort end');
		return out;
	};

	toggleCollapse = () => {
		if (this.state.activeKeys.length > 0) {
			// Collapse all
			this.setState({ activeKeys: [] });
		} else {
			// Expand All
			this.setState({
				activeKeys: this.state.responses.map((r) => r.key.toString()),
			});
		}
	};

	maxTriesValidator = (formInstance) => {
		const validator = (_, value) => {
			if (value !== '' && value !== 0) {
				this.setState({ triesWarning: false });
				if (this.state.no_deduction) {
					let curr = formInstance.getFieldsValue(['grade_policy']);
					formInstance.setFieldsValue({
						grade_policy: { ...curr, free_tries: value },
					});
				} else {
					const free = formInstance.getFieldValue([`grade_policy`, `free_tries`]);
					if (free !== '' && free > value) {
						return Promise.reject(
							new Error(
								'Oops, you have more free tries than the total number of tries.'
							)
						);
					}
				}
			} else if (value === 0) {
				this.setState({ triesWarning: true });
			}
			return Promise.resolve();
		};
		return {
			validator,
		};
	};

	helpIcon = (helpText) => ({
		title: helpText,
		trigger: 'click',
		icon: <QuestionCircleOutlined style={{ color: 'blue' }} />,
	});

	renderFields = (fields, remove, move) => {
		// console.log('fields', fields);
		return (
			<Collapse
				activeKey={this.state.activeKeys}
				onChange={(new_val) => this.setState({ activeKeys: new_val })}
				style={{ marginBottom: 12 }}
			>
				{fields.map(({ key, name, ...restField }) => {
					let index = name;
					let k = this.state.responses?.[index] ?? {};
					switch (k.type?.name) {
						case 'multiple':
							// console.log('mult choice formitems', k);
							return (
								<MultipleChoice
									fetched={k}
									images={this.state.images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											move(index, index - 1);
											this.swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											move(index, index + 1);
											this.swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Multiple Choice ' + (index + 1)}
									remove={() => {
										remove(index);
										this.remove(k.key);
									}}
									changeOrder={(order) => {
										this.changeOrder(k.key, order);
									}}
									changeIdentifier={(ident) => {
										this.changeIdentifier(k.key, ident);
									}}
									helpIcon={this.helpIcon}
								/>
							);
						case 'tree':
							return (
								<InputField
									fetched={k}
									images={this.state.images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											move(index, index - 1);
											this.swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											move(index, index + 1);
											this.swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Input Field ' + (index + 1)}
									remove={() => {
										remove(index);
										this.remove(k.key);
									}}
									changeIdentifier={(ident) => {
										this.changeIdentifier(k.key, ident);
									}}
									helpIcon={this.helpIcon}
								/>
							);
						case 'algebraic':
							return (
								<MathLiveField
									fetched={k}
									images={this.state.images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											move(index, index - 1);
											this.swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											move(index, index + 1);
											this.swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Algebraic Field ' + (index + 1)}
									remove={() => {
										remove(index);
										this.remove(k.key);
									}}
									changeIdentifier={(ident) => {
										this.changeIdentifier(k.key, ident);
									}}
									helpIcon={this.helpIcon}
								/>
							);
						case 'matrix':
							return (
								<MatrixField
									fetched={k}
									images={this.state.images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											move(index, index - 1);
											this.swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											move(index, index + 1);
											this.swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Matrix Field ' + (index + 1)}
									remove={() => {
										remove(index);
										this.remove(k.key);
									}}
									changeIdentifier={(ident) => {
										this.changeIdentifier(k.key, ident);
									}}
									helpIcon={this.helpIcon}
								/>
							);
						case 'sagecell':
							return (
								<SagePlayground
									fetched={this.props.question.responses?.[index] ?? {}}
									images={this.state.images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											move(index, index - 1);
											this.swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											move(index, index + 1);
											this.swap(index, index + 1);
										}
									}}
									id={k.key}
									key={k.key}
									index={index}
									form={this.props.form}
									title={'SageCell ' + (index + 1)}
									remove={() => {
										remove(index);
										this.remove(k.key);
									}}
									changeIdentifier={(ident) => {
										this.changeIdentifier(k.key, ident);
									}}
								/>
							);
						default:
							return (
								<Card
									title={'Custom Template ' + k.key}
									key={k.key}
									type="inner"
									size="small"
									bodyStyle={{
										backgroundColor: theme['@white'],
									}}
									extra={
										<DeleteOutlined
											onClick={() => {
												this.remove(k.key);
											}}
										/>
									}
								>
									Some custom templates
								</Card>
							);
					}
				})}
			</Collapse>
		);
	};

	render() {
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
		};

		const formItemLayoutWithoutLabel = {
			wrapperCol: { span: 24 },
		};

		const delimiters = (type) => {
			let content = '';
			if (type === 'matrix') {
				content = 'a & b\\\\ c & d';
			} else if (type === 'vector') {
				content = 'a \\\\ b';
			}
			return (
				<Select>
					<Option value="parenthesis">
						<XmlRender noBorder inline>
							{`<m>\\begin{psmallmatrix}${content}\\end{psmallmatrix}</m>`}
						</XmlRender>
					</Option>
					<Option value="brackets">
						<XmlRender noBorder inline>
							{`<m>\\begin{bsmallmatrix}${content}\\end{bsmallmatrix}</m>`}
						</XmlRender>
					</Option>
					<Option value="braces">
						<XmlRender noBorder inline>
							{`<m>\\begin{Bsmallmatrix}${content}\\end{Bsmallmatrix}</m>`}
						</XmlRender>
					</Option>
					<Option value="angles">
						<XmlRender noBorder inline>
							{`<m>\\left\\langle\\begin{smallmatrix}${content}\\end{smallmatrix}\\right\\rangle</m>`}
						</XmlRender>
					</Option>
					<Option value="pipes">
						<XmlRender noBorder inline>
							{`<m>\\begin{vsmallmatrix}${content}\\end{vsmallmatrix}</m>`}
						</XmlRender>
					</Option>
					<Option value="double_pipes">
						<XmlRender noBorder inline>
							{`<m>\\begin{Vsmallmatrix}${content}\\end{Vsmallmatrix}</m>`}
						</XmlRender>
					</Option>
				</Select>
			);
		};

		return (
			<div
				style={{
					padding: 22,
					background: '#fff',
					height: '89vh',
					overflowY: 'auto',
					borderStyle: 'solid',
					borderRadius: '4px',
					borderColor: '#EEE',
					borderWidth: '2px',
				}}
			>
				<h1>
					{this.props?.question?.id ? 'Edit Question' : 'New Question'}
					{!this.props.preview && this.props.previewIcon}
				</h1>
				<DndProvider backend={HTML5Backend}>
					<Form form={this.props.form} initialValues={this.defaults} labelWrap={true}>
						{/*Descriptor */}
						<Form.Item
							label={'Descriptor'}
							tooltip={this.helpIcon(
								'Descriptor identifies this question in the Questionbank (not shown to students).'
							)}
							{...formItemLayout}
							name="descriptor"
							rules={[
								{
									required: true,
									message: 'Please enter a descriptor for the question!',
								},
							]}
						>
							<Input placeholder="Enter the descriptor to identify the question in the Questionbank." />
						</Form.Item>
						{/*Title */}
						<Form.Item
							label={'Title'}
							tooltip={this.helpIcon(
								'Within a Quiz the student sees the title as a headline of the question. (Optional)'
							)}
							{...formItemLayout}
							name="title"
						>
							<Input
								disabled={this.state.desc_as_title}
								placeholder="Enter a title to be displayed to the student. (Optional)"
							/>
						</Form.Item>
						{/*Descriptor as title*/}
						<Form.Item
							label={'Use descriptor as the title'}
							tooltip={this.helpIcon(
								<span>
									If this is checked then the descriptor will be shown in the
									Questionbank <strong>and</strong> to students in quizzes.
								</span>
							)}
							// wrapperCol={{offset: 4, span: 20}}
							{...formItemLayout}
							name="desc_as_title"
							valuePropName="checked"
						>
							<Switch
								onChange={() => {
									this.setState({
										desc_as_title: !this.state.desc_as_title,
									});
								}}
							></Switch>
						</Form.Item>

						{/*Course */}
						<GetCourseSelectBar
							form={this.props.form}
							token={this.props.token}
							value={
								this.props.course ? this.props.course : this.props.question.course
							}
							allowEmpty={true}
							helpIcon={this.helpIcon('')}
						/>
						{/*Tags */}
						<GetTagsSelectBar
							form={this.props.form}
							token={this.props.token}
							helpIcon={this.helpIcon(
								'Identify a question by tagging it. Criteria: Topic, type of question, number of tries, difficulty'
							)}
						/>

						{/*Text */}
						<Form.Item
							label="Text"
							tooltip={this.helpIcon(
								`The code here is rendered as the "question" to the student. Codes: <m>inline math</m>; <M>display math</M>; <v>question parameter</v>; answer input field: <ibox id="ans1"/>  (see Help button on Advanced tab for details)`
							)}
							{...formItemLayout}
							name="text"
							getValueProps={(value) => (value ? value.code : '')} // necessary
						>
							<XmlEditor initialValue={this.props.question?.text} />
						</Form.Item>

						{/*Script */}
						<Form.Item
							label="Question Script"
							tooltip={this.helpIcon(
								'Define variables and functions for use in the question text and the evaluation tree. Only the one lanugage (highlighted) can be used.'
							)}
							{...formItemLayout}
						>
							<span>
								<Radio.Group
									value={this.state.language}
									onChange={(value) =>
										this.setState({
											language: value.target.value,
										})
									}
									defaultValue="sage"
									size={'small'}
									buttonStyle="solid"
								>
									<Radio.Button value="sage">Python</Radio.Button>
									<Radio.Button value="maxima">Maxima</Radio.Button>
								</Radio.Group>
							</span>
							<CodeEditor
								value={this.state.script}
								language={this.state.language}
								onChange={(value) => this.setState({ script: value })}
							/>
						</Form.Item>

						<Button onClick={this.toggleCollapse}>
							{this.state.activeKeys.length > 0 ? 'Collapse all' : 'Expand All'}
						</Button>

						<Form.List name="responses">
							{(fields, { add, remove, move }) => (
								<>
									{this.renderFields(fields, remove, move)}
									{/*New Response */}
									<Form.Item {...formItemLayoutWithoutLabel}>
										<Button
											style={{ width: '100%' }}
											type="primary"
											icon={<PlusOutlined />}
											onClick={() => this.addComponent(add)}
										>
											New Response
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>

						<Divider />

						{/*Tree */}
						<Form.Item
							label="Evaluation Tree"
							tooltip={this.helpIcon(
								"This field is used to define a tree of nodes that will evaluate the student's answers and give them a grade"
							)}
							{...formItemLayout}
						>
							<Collapse defaultActiveKey={[this.props.question?.id]}>
								<Collapse.Panel>
									<div style={{ overflow: 'auto' }}>
										<DecisionTree
											tree={this.state.tree}
											responses={this.state.responses}
											onChange={(value) => this.setState({ tree: value })}
											form={this.props.form}
										/>
										<Divider style={{ marginBottom: 4 }} />
									</div>
								</Collapse.Panel>
							</Collapse>
						</Form.Item>

						{/*Solution */}
						<Form.Item
							label="Solution"
							tooltip={this.helpIcon(
								'Shown to student after they have attempted the question. Unlike feedback, which is dependant on their answers, the solution is the same for everybody (may depend on the vaiable in the question text).'
							)}
							{...formItemLayout}
							name="solution"
							getValueProps={(value) => (value ? value.code : '')} // necessary
						>
							<XmlEditor initialValue={this.props.question?.solution} />
						</Form.Item>

						{/*Images */}
						<Form.Item
							label="Question Images"
							tooltip={this.helpIcon(
								`You can upload images here to associate them with this question and embed them in the question text/solution with <QImg index="0"/> to embed the 0th image in this field you can also drag them to the text area to automatically add the embed text`
							)}
							{...formItemLayout}
						>
							<QuestionImages
								id={this.props.question?.id}
								images={this.state.images}
								updateState={(value) => this.setState({ images: value })}
							/>
						</Form.Item>

						<Divider />
						{/*Vector delimiters */}
						<Form.Item
							label="Vector delimiters"
							tooltip={this.helpIcon('')}
							{...formItemLayout}
							name={['options', 'vector_delimiters']}
						>
							{delimiters('vector')}
						</Form.Item>

						{/*Matrix delimiters */}
						<Form.Item
							label="Matrix delimiters"
							tooltip={this.helpIcon('')}
							{...formItemLayout}
							name={['options', 'matrix_delimiters']}
						>
							{delimiters('matrix')}
						</Form.Item>

						<Divider />

						{/*Titles of try options */}
						<Row>
							<Col span={7} offset={4}>
								<span>Tries </span>
								<Tooltip
									title="How many tries does the student have on this question, you can enter 0 for unlimited tries"
									trigger="click"
								>
									<QuestionCircleOutlined style={{ color: 'blue' }} />
								</Tooltip>
								<span>:</span>
							</Col>
							<Col span={7}>
								<span>Deduction per Try </span>
								<Tooltip
									title="This percent will be removed from the student's final answer for each try they use after all free tries are used"
									trigger="click"
								>
									<QuestionCircleOutlined style={{ color: 'blue' }} />
								</Tooltip>
								<span>:</span>
							</Col>
							<Col span={6}>
								<span>Free Tries </span>
								<Tooltip
									title="How many tries does the student get before they start getting deductions"
									trigger="click"
								>
									<QuestionCircleOutlined style={{ color: 'blue' }} />
								</Tooltip>
								<span>:</span>
							</Col>
						</Row>

						{/*Inputs of try options */}
						<Row style={{ marginTop: 16 }}>
							<Col span={7} offset={4}>
								<Form.Item
									name={['grade_policy', 'max_tries']}
									dependencies={[['grade_policy', 'free_tries']]}
									rules={[
										{
											required: true,
											message: 'You must input a number.',
										},
										this.maxTriesValidator,
									]}
								>
									<InputNumber min={0} max={10} />
								</Form.Item>
								<span hidden={!this.state.triesWarning} style={{ color: 'orange' }}>
									User will have unlimited tries.
								</span>
							</Col>
							<Col span={7}>
								<Form.Item name={['grade_policy', 'penalty_per_try']}>
									<InputNumber
										min={0}
										max={100}
										formatter={(value) => `${value}%`}
										parser={(value) => value.replace('%', '')}
										onChange={(e) => {
											if (e === 0) {
												this.setState({
													no_deduction: true,
												});
												let max = this.props.form.getFieldValue([
													'grade_policy',
													'max_tries',
												]);
												this.props.form.setFieldsValue([
													{
														name: ['grade_policy', 'free_tries'],
														value: max,
													},
												]);
											} else {
												this.setState({
													no_deduction: false,
												});
											}
										}}
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									name={['grade_policy', 'free_tries']}
									rules={[
										{
											required: true,
											message: 'You must input a number.',
										},
									]}
								>
									<InputNumber
										disabled={this.state.no_deduction}
										min={1}
										max={10}
									/>
								</Form.Item>
							</Col>
						</Row>
						<Divider />
					</Form>
				</DndProvider>
				{/* zIndex is 5 because Ace editor gutter zIndex is 4 */}
				<Row
					style={{
						position: 'fixed',
						bottom: '0',
						padding: 10,
						background: '#EEE',
						height: 'auto',
						width: 'calc(100% - 70px)',
						zIndex: 5,
					}}
				>
					<Col span={12} style={{ float: 'left' }}>
						<Button type="primary" onClick={this.handlePreview}>
							Preview
						</Button>
					</Col>
					<Col span={12} style={{ float: 'right' }}>
						{this.props.question?.id && (
							<Button
								style={{ float: 'right' }}
								type="default"
								onClick={(e) => this.handleSubmit(e, false)}
							>
								Save and Continue
							</Button>
						)}
						<Button
							style={{ float: 'right' }}
							type="default"
							onClick={(e) => this.handleSubmit(e, true)}
						>
							Save
						</Button>
						<Button
							style={{ float: 'right' }}
							type="default"
							onClick={this.props.history.goBack}
						>
							Cancel
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

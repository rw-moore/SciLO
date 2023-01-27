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
import { MathJaxBaseContext } from 'better-react-mathjax';
import moment from 'moment';
import React, { useContext, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import theme from '../../config/theme';
import useUnsavedChangesWarning from '../../hooks/useSaveUnsavedChangesWarning';
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
const { Panel } = Collapse;
/**
 * Create/modify a question
 */
export default function CreateQuestionForm(props) {
	const mjContext = useContext(MathJaxBaseContext);
	const [form] = Form.useForm();
	const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
	const [latexPreamble, setLatexPreamble] = useState(props.question?.latexPreamble ?? '');
	const [descAsTitle, setDescAsTitle] = useState(props?.desc_as_title ?? false);
	const [script, setScript] = useState(props.question?.variables?.value ?? undefined);
	const [language, setLanguage] = useState(props.question?.variables?.language ?? 'sage');
	const [tree, setTree] = useState(props.question?.tree ?? {});
	// const [mark, setMark] = useState(props.question?.mark ?? 0);
	const [triesWarning, setTriesWarning] = useState(
		props.question?.grade_policy?.max_tries === 0 || false
	);
	const [no_deduction, setNoDeduction] = useState(
		props.question?.grade_policy?.penalty_per_try === 0 || false
	);
	const [responses, setResponses] = useState(
		props.question?.responses?.map?.((response) => ({
			...response,
			key: response.id.toString(),
			answerOrder: Object.keys(response?.answers ?? {}),
		})) ?? []
	);
	const [images, setImages] = useState(props.images || []);
	const [activeKeys, setActiveKeys] = useState([]);
	const defaults = useMemo(() => {
		let out = {
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
			switch (k.type.name) {
				case 'multiple':
					// console.log('mult choice formitems', k);
					out.responses[index] = {
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
					out.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						type: {
							label: k?.type?.label ?? 'Answer',
							size: k?.type?.size ?? 5,
							correct: k?.type?.correct ?? '',
							patterntype: k?.type?.patterntype ?? 'Custom',
							pattern: k?.type?.pattern ?? '',
							patternflag: k?.type?.patternflag ?? '',
							patternfeedback: k?.type?.patternfeedback ?? '',
							hasUnits: k?.type?.hasUnits ?? false,
							name: 'tree',
						},
						id: k?.id,
					};
					break;
				case 'algebraic':
					out.responses[index] = {
						text: k?.text ?? '',
						identifier: k?.identifier ?? '',
						type: {
							name: 'algebraic',
							correct: k?.type?.correct ?? '',
							keyboards: k?.type?.keyboards ?? ['alphabet-keyboard'],
						},
						id: k?.id,
					};
					break;
				case 'matrix':
					out.responses[index] = {
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
					out.responses[index] = {
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
		return out;
	}, [props.question, props.course]);

	/* remove a response with id:k */
	const remove = (k) => {
		// can use data-binding to get
		let fresponses = responses;
		let idx = fresponses.findIndex((r) => r.key === k);
		let resp = fresponses.splice(idx, 1)[0];
		let ftree = tree;
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
			ftree = removeNode(ftree, resp.identifier);
		}
		setTree(ftree);
		setResponses(fresponses);
	};

	/* add a new response */
	const add = (addResp, add_func) => {
		const fresponses = responses;

		const nextKeys = fresponses.concat({
			key: randomID(),
			type: { name: addResp },
			answerOrder: [],
		});
		const newResp = addResp;
		let newData = {};
		setResponses(nextKeys);
		if (newResp === 'tree') {
			newData = {
				text: '',
				identifier: '',
				type: {
					label: 'Answer',
					name: 'tree',
					patterntype: 'Custom',
					pattern: '',
					patternflag: '',
					patternfeedback: '',
					correct: '',
					hasUnits: false,
					size: 5,
				},
			};
		} else if (newResp === 'algebraic') {
			newData = {
				text: '',
				identifier: '',
				type: {
					name: 'algebraic',
					correct: '',
					keyboards: ['alphabet-keyboard'],
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
	const swap = (i, j) => {
		// console.log('swap');
		const fresponses = responses;
		if (j < 0 || j >= fresponses.length) {
			return;
		}
		[fresponses[i], fresponses[j]] = [fresponses[j], fresponses[i]];
		setResponses(fresponses);
	};

	/* change order of the answers in the response with id:k */
	const changeOrder = (k, new_responses, cb) => {
		// console.log('change order');
		let fresponses = responses;
		let index;
		fresponses.forEach((r, i) => {
			if (r.key === k) {
				r.answerOrder = Object.keys(new_responses[i].answers);
				index = i;
			}
		});
		setResponses(fresponses);
		form.setFieldsValue(new_responses);
		form.validateFields([['responses', index, 'answers']])
			.then((values) => {
				console.log('changeOrder', values);
			})
			.catch((err) => {
				console.error('changeOrder', err);
			});
	};

	/* change identifier in state so the tree can find it */
	const changeIdentifier = (k, newIdentifier) => {
		// console.log('change ident');
		let fresponses = responses;
		let resp = fresponses.find((r) => r.key === k);
		let oldIdentifier = resp.identifier;
		resp.identifier = newIdentifier;
		if (['multiple', 'algeb', 'tree'].includes(resp.type.name)) {
			let ftree = tree;
			const updateTree = function (tree, oldId, newId) {
				if (tree.children) {
					for (var i = tree.children.length - 1; i >= 0; i--) {
						if (tree.children[i].identifier === oldId) {
							tree.children[i].identifier = newId;
						}
						if (tree.children[i].children) {
							tree.children[i] = updateTree(tree.children[i], oldId, newId);
						}
					}
				}
				return tree;
			};
			ftree = updateTree(ftree, oldIdentifier, newIdentifier);
			setTree(ftree);
		}
		setResponses(fresponses);
	};

	const afterSubmitQuestion = (data, returnToQB) => {
		if (!data || data.status !== 200) {
			message.error('Submit failed, see browser console for more details.');
			console.error(data);
		} else {
			//PUT images to /api/questions/{data.question.id}/images
			// console.log('after', data);
			// console.log(this.state.images);
			PutQuestionImages(data.data.question.id, images, props.token).then((image_data) => {
				if (!image_data || image_data.status !== 200) {
					message.error('Image submission failed, see browser console for more details.');
					console.error(image_data);
				} else {
					if (returnToQB) {
						props.goBack();
					} else {
						message.success('Question was saved successfully.');
						props.fetch(() => {
							const fresponses = props.question.responses;
							// console.log('fresp', fresponses);
							fresponses.forEach((resp) => {
								resp.key = resp.id.toString();
								resp.answerOrder = Object.keys(resp.answers);
							});
							setResponses(fresponses);
							form.setFieldValue(
								'tags',
								props.question.tags.map((tag) => tag.name)
							);
						});
					}
				}
			});
		}
	};

	const confirmSubmit = (values, returnToQB) => {
		if (props.question?.id) {
			PutQuestion(props.question.id, values, props.token).then((data) =>
				afterSubmitQuestion(data, returnToQB)
			);
		} else {
			values.create_date = moment().format(timeFormat);
			PostQuestion(values, props.token).then((data) => afterSubmitQuestion(data, returnToQB));
		}
	};

	/* triggered when the submit button is clicked */
	const handleSubmit = (e, returnToQB) => {
		e.preventDefault();
		form.validateFields()
			.then((values) => {
				setPristine();
				values.variables = {
					type: 'script',
					language: language || 'sage',
					value: script || '',
				};
				values.tree = tree || {};
				values.tree.name = 'tree';
				values.tags = parseTags(values.tags);
				values.responses = sortResponses(values.responses);
				values.latexPreamble = latexPreamble;
				values.last_modify_date = moment().format(timeFormat);
				console.log('Received values of form: ', values);
				// console.log("Json", JSON.stringify(values));
				const total_mark = calculateMark(
					tree,
					values.responses.reduce(function (map, obj) {
						map[obj.identifier] = obj;
						return map;
					}, {}),
					form
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
							confirmSubmit(values, returnToQB);
						},
					});
				} else {
					confirmSubmit(values, returnToQB);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	/* triggered when the preview button is clicked */
	const handlePreview = (e) => {
		e.preventDefault();
		form.validateFields()
			.then((values) => {
				values.variables = {
					type: 'script',
					language: language || 'sage',
					value: script || '',
				};
				values.tree = tree || {};
				values.tree.name = 'tree';
				values.tags = parseTags(values.tags);
				values.responses = sortResponses(values.responses);
				values.latexPreamble = latexPreamble;
				console.log('Received values of form: ', values);
				// console.log("Json", JSON.stringify(values));
				props.updatePreview(values, images);
				return values;
			})
			.catch((err) => {
				console.error(err);
			});
	};

	/* render function of adding a response */
	const addComponent = (add_func) => {
		// select component which is used to choose a response type
		let addResp = null;
		const group = (
			<Select
				onChange={(e) => {
					addResp = e;
				}}
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
		let addModal = Modal.confirm({
			title: 'Add Response',
			content: group,
			okText: 'OK',
			cancelText: 'Cancel',
			onOk: () => {
				addModal.destroy();
				add(addResp, add_func);
			},
		});
	};

	/* post processing of the tags information */
	const parseTags = (tags) => {
		if (tags) {
			return tags.map((tag) => ({ name: tag.trim() }));
		}
	};

	/* sort the responses by their ids matching the order */
	const sortResponses = (fresponses) => {
		// console.log('sortresp', responses);
		// console.log(this.state.responses);
		// const index = (key) => {
		//     const arr = this.state.responses.map(item => item.index);
		//     return arr.indexOf(key)
		// };

		if (!fresponses) {
			return [];
		}
		// console.log('sort passed');
		fresponses = Object.entries(fresponses);
		fresponses.forEach((item) => {
			// console.log('sort mid1', item);
			if (!item[1].answers) {
				return;
			}
			// console.log('sort mid');
			const answerIndex = (answerID) => responses[item[0]].answerOrder.indexOf(answerID);
			item[1].answers = Object.entries(item[1].answers);
			item[1].answers.sort((a, b) => (answerIndex(a[0]) > answerIndex(b[0]) ? 1 : -1));
			item[1].answers = item[1].answers.map((item) => item[1]);
			// console.log('sort mid end');
		});
		fresponses.sort((a, b) => (a[0] > b[0] ? 1 : -1));
		let out = fresponses.map((item) => item[1]);
		// console.log('sort end');
		return out;
	};

	const toggleCollapse = () => {
		if (activeKeys.length > 0) {
			// Collapse all
			setActiveKeys([]);
		} else {
			// Expand All
			setActiveKeys(responses.map((r) => r.key.toString()));
		}
	};

	const maxTriesValidator = (formInstance) => {
		const validator = (_, value) => {
			if (value !== '' && value !== 0) {
				setTriesWarning(false);
				if (no_deduction) {
					formInstance.setFieldValue(['grade_policy', 'free_tries'], value);
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
				setTriesWarning(true);
			}
			return Promise.resolve();
		};
		return {
			validator,
		};
	};

	const helpIcon = (helpText) => ({
		title: helpText,
		trigger: 'click',
		icon: <QuestionCircleOutlined style={{ color: 'blue' }} />,
	});

	const renderFields = (fields, operations) => {
		// console.log('fields', fields);
		return (
			<Collapse
				activeKey={activeKeys}
				onChange={(new_val) => setActiveKeys(new_val)}
				style={{ marginBottom: 12 }}
			>
				{fields.map(({ key, name, ...restField }) => {
					let index = name;
					let k = responses?.[index] ?? {};
					switch (k.type?.name) {
						case 'multiple':
							// console.log('mult choice formitems', k);
							return (
								<MultipleChoice
									fetched={k}
									images={images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											operations.move(index, index - 1);
											swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											operations.move(index, index + 1);
											swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Multiple Choice ' + (index + 1)}
									remove={() => {
										operations.remove(index);
										remove(k.key);
									}}
									changeOrder={(order) => {
										changeOrder(k.key, order);
									}}
									changeIdentifier={(ident) => {
										changeIdentifier(k.key, ident);
									}}
									helpIcon={helpIcon}
								/>
							);
						case 'tree':
							return (
								<InputField
									fetched={k}
									images={images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											operations.move(index, index - 1);
											swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											operations.move(index, index + 1);
											swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Input Field ' + (index + 1)}
									remove={() => {
										operations.remove(index);
										remove(k.key);
									}}
									changeIdentifier={(ident) => {
										changeIdentifier(k.key, ident);
									}}
									helpIcon={helpIcon}
								/>
							);
						case 'algebraic':
							return (
								<MathLiveField
									fetched={k}
									images={images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											operations.move(index, index - 1);
											swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											operations.move(index, index + 1);
											swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Algebraic Field ' + (index + 1)}
									remove={() => {
										operations.remove(index);
										remove(k.key);
									}}
									changeIdentifier={(ident) => {
										changeIdentifier(k.key, ident);
									}}
									helpIcon={helpIcon}
								/>
							);
						case 'matrix':
							return (
								<MatrixField
									fetched={k}
									images={images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											operations.move(index, index - 1);
											swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											operations.move(index, index + 1);
											swap(index, index + 1);
										}
									}}
									id={k.key}
									key={key}
									name={name}
									field={restField}
									title={'Matrix Field ' + (index + 1)}
									remove={() => {
										operations.remove(index);
										remove(k.key);
									}}
									changeIdentifier={(ident) => {
										changeIdentifier(k.key, ident);
									}}
									helpIcon={helpIcon}
								/>
							);
						case 'sagecell':
							return (
								<SagePlayground
									fetched={props.question.responses?.[index] ?? {}}
									images={images}
									up={(event) => {
										event.stopPropagation();
										if (index > 0) {
											operations.move(index, index - 1);
											swap(index, index - 1);
										}
									}}
									down={(event) => {
										event.stopPropagation();
										if (index < fields.length - 1) {
											operations.move(index, index + 1);
											swap(index, index + 1);
										}
									}}
									id={k.key}
									key={k.key}
									index={index}
									form={form}
									title={'SageCell ' + (index + 1)}
									remove={() => {
										operations.remove(index);
										remove(k.key);
									}}
									changeIdentifier={(ident) => {
										changeIdentifier(k.key, ident);
									}}
								/>
							);
						default:
							return (
								<Panel>
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
													remove(k.key);
												}}
											/>
										}
									>
										Some custom templates
									</Card>
								</Panel>
							);
					}
				})}
			</Collapse>
		);
	};

	const delimiters = (type) => {
		let content = '';
		if (type === 'matrix') {
			content = 'a & b\\\\ c & d';
		} else if (type === 'vector') {
			content = 'a \\\\ b';
		}
		return (
			<Select
				id={`form_${type}_delimiter`}
				onChange={() => {
					if (mjContext) {
						mjContext.promise.then((mathjax) => {
							setTimeout(() => {
								let container = document
									.getElementById(`form_${type}_delimiter`)
									.parentElement.parentElement.querySelector(
										'.MathJax'
									).parentElement;
								let jax = mathjax.Hub.getAllJax(container);
								console.log('jax', jax);
							}, 1000);
						});
					}
				}}
				// value={form.getFieldValue(['options', type + '_delimiters'])}
				options={[
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\begin{psmallmatrix}${content}\\end{psmallmatrix}</m>`}
							</XmlRender>
						),
						value: 'parenthesis',
					},
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\begin{bsmallmatrix}${content}\\end{bsmallmatrix}</m>`}
							</XmlRender>
						),
						value: 'brackets',
					},
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\begin{Bsmallmatrix}${content}\\end{Bsmallmatrix}</m>`}
							</XmlRender>
						),
						value: 'braces',
					},
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\left\\langle\\begin{smallmatrix}${content}\\end{smallmatrix}\\right\\rangle</m>`}
							</XmlRender>
						),
						value: 'angles',
					},
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\begin{vsmallmatrix}${content}\\end{vsmallmatrix}</m>`}
							</XmlRender>
						),
						value: 'pipes',
					},
					{
						label: (
							<XmlRender noBorder inline>
								{`<m>\\begin{Vsmallmatrix}${content}\\end{Vsmallmatrix}</m>`}
							</XmlRender>
						),
						value: 'double_pipes',
					},
				]}
			></Select>
		);
	};

	const formItemLayout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 20 },
	};

	const formItemLayoutWithoutLabel = {
		wrapperCol: { span: 24 },
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
			{Prompt}
			<h1>
				{props?.question?.id ? 'Edit Question' : 'New Question'}
				{!props.preview && props.previewIcon}
			</h1>
			<DndProvider backend={HTML5Backend}>
				<Form
					form={form}
					initialValues={defaults}
					labelWrap={true}
					onValuesChange={() => {
						setDirty();
					}}
				>
					{/*Descriptor */}
					<Form.Item
						label={'Descriptor'}
						tooltip={helpIcon(
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
						tooltip={helpIcon(
							'Within a Quiz the student sees the title as a headline of the question. (Optional)'
						)}
						{...formItemLayout}
						name="title"
					>
						<Input
							disabled={descAsTitle}
							placeholder="Enter a title to be displayed to the student. (Optional)"
						/>
					</Form.Item>
					{/*Descriptor as title*/}
					<Form.Item
						label={'Use descriptor as the title'}
						tooltip={helpIcon(
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
								setDescAsTitle(!descAsTitle);
							}}
						></Switch>
					</Form.Item>

					{/*Course */}
					<GetCourseSelectBar
						form={form}
						token={props.token}
						value={props.course ? props.course : props.question.course}
						allowEmpty={true}
						helpIcon={helpIcon('')}
					/>
					{/*Tags */}
					<GetTagsSelectBar
						form={form}
						token={props.token}
						helpIcon={helpIcon(
							'Identify a question by tagging it. Criteria: Topic, type of question, number of tries, difficulty'
						)}
					/>

					{/*Text */}
					<Form.Item
						label="Text"
						tooltip={helpIcon(
							`The code here is rendered as the "question" to the student. Codes: <m>inline math</m>; <M>display math</M>; <v>question parameter</v>; answer input field: <ibox id="ans1"/>  (see Help button on Advanced tab for details)`
						)}
						{...formItemLayout}
						name="text"
						getValueProps={(value) => {
							// console.log('getvalueprops', value);
							return value ? value.code : '';
						}} // necessary
					>
						<XmlEditor
							changeLatex={(latex) => {
								setLatexPreamble(latex);
							}}
							initialValue={{
								text: props.question?.text,
								latex: latexPreamble,
							}}
							showPreamble={true}
						/>
					</Form.Item>

					{/*Script */}
					<Form.Item
						label="Question Script"
						tooltip={helpIcon(
							'Define variables and functions for use in the question text and the evaluation tree. Only the one lanugage (highlighted) can be used.'
						)}
						{...formItemLayout}
					>
						<span>
							<Radio.Group
								value={language}
								onChange={(value) => {
									setLanguage(value.target.value);
									setDirty();
								}}
								defaultValue="sage"
								size={'small'}
								buttonStyle="solid"
							>
								<Radio.Button value="sage">Python</Radio.Button>
								<Radio.Button value="maxima">Maxima</Radio.Button>
							</Radio.Group>
						</span>
						<CodeEditor
							value={script}
							language={language}
							onChange={(value) => {
								setScript(value);
								setDirty();
							}}
						/>
					</Form.Item>

					<Button onClick={toggleCollapse}>
						{activeKeys.length > 0 ? 'Collapse all' : 'Expand All'}
					</Button>

					<Form.List name="responses">
						{(fields, { add, remove, move }) => (
							<>
								{renderFields(fields, { remove, move })}
								{/*New Response */}
								<Form.Item {...formItemLayoutWithoutLabel}>
									<Button
										style={{ width: '100%' }}
										type="primary"
										icon={<PlusOutlined />}
										onClick={() => addComponent(add)}
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
						tooltip={helpIcon(
							"This field is used to define a tree of nodes that will evaluate the student's answers and give them a grade"
						)}
						{...formItemLayout}
					>
						<Collapse defaultActiveKey={[props.question?.id]}>
							<Collapse.Panel>
								<div style={{ overflow: 'auto' }}>
									<DecisionTree
										tree={tree}
										responses={responses}
										onChange={(value) => {
											setTree(value);
											setDirty();
										}}
										form={form}
									/>
									<Divider style={{ marginBottom: 4 }} />
								</div>
							</Collapse.Panel>
						</Collapse>
					</Form.Item>

					{/*Solution */}
					<Form.Item
						label="Solution"
						tooltip={helpIcon(
							'Shown to student after they have attempted the question. Unlike feedback, which is dependant on their answers, the solution is the same for everybody (may depend on the vaiable in the question text).'
						)}
						{...formItemLayout}
						name="solution"
						getValueProps={(value) => (value ? value.code : '')} // necessary
					>
						<XmlEditor
							initialValue={{
								text: props.question?.solution,
							}}
						/>
					</Form.Item>

					{/*Images */}
					<Form.Item
						label="Question Images"
						tooltip={helpIcon(
							`You can upload images here to associate them with this question and embed them in the question text/solution with <QImg index="0"/> to embed the 0th image in this field you can also drag them to the text area to automatically add the embed text`
						)}
						{...formItemLayout}
					>
						<QuestionImages
							id={props.question?.id}
							images={images}
							updateState={(value) => {
								setImages(value);
								setDirty();
							}}
						/>
					</Form.Item>

					<Divider />
					{/*Vector delimiters */}
					<Form.Item
						label="Vector delimiters"
						tooltip={helpIcon('')}
						{...formItemLayout}
						name={['options', 'vector_delimiters']}
					>
						{delimiters('vector')}
					</Form.Item>

					{/*Matrix delimiters */}
					<Form.Item
						label="Matrix delimiters"
						tooltip={helpIcon('')}
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
									maxTriesValidator,
								]}
							>
								<InputNumber min={0} max={10} />
							</Form.Item>
							<span hidden={!triesWarning} style={{ color: 'orange' }}>
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
											setNoDeduction(true);
											form.setFieldValue(
												['grade_policy', 'free_tries'],
												form.getFieldValue(['grade_policy', 'max_tries'])
											);
										} else {
											setNoDeduction(false);
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
								<InputNumber disabled={no_deduction} min={1} max={10} />
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
					<Button type="primary" onClick={handlePreview}>
						Preview
					</Button>
				</Col>
				<Col span={12} style={{ float: 'right' }}>
					{props.question?.id && (
						<Button
							style={{ float: 'right' }}
							type="default"
							onClick={(e) => handleSubmit(e, false)}
						>
							Save and Continue
						</Button>
					)}
					<Button
						style={{ float: 'right' }}
						type="default"
						onClick={(e) => handleSubmit(e, true)}
					>
						Save
					</Button>
					<Button style={{ float: 'right' }} type="default" onClick={props.goBack}>
						Cancel
					</Button>
				</Col>
			</Row>
		</div>
	);
}

import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Col,
	Divider,
	Empty,
	Form,
	Input,
	message,
	Radio,
	Row,
	Select,
	Space,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import { unit } from 'mathjs';
import React from 'react';
import theme from '../../config/theme';
import API from '../../networks/Endpoints';
import { UnitsHelper } from '../../utils/unitsHelper';
import { getUnitString } from '../Editor/XmlConverter';
import XmlRender from '../Editor/XmlRender';
import MathField from '../MathLive/MathLiveField';
import SageCell from '../SageCell';
import './QuestionPreviews.css';
import QuestionStatsCollapse from './QuestionStatsCollapse';
import { isNumeric, setTexEnvironment } from './sharedFrame';

const FormItem = Form.Item;

/* Answer Question Component */
export default class QuestionFrame extends React.Component {
	state = {
		answers: {},
		images: this.props.question.question_image.map((file) => ({
			...file,
			url: API.domain + '/api' + file.url,
		})),
	};

	componentDidMount() {
		this.loadAnswer();
	}

	// load pre-answer into components
	loadAnswer = () => {
		let newAnswers = this.state.answers;
		for (const index in this.props.question.tries) {
			// if there were no answers
			if (this.props.question.tries[index][0] === null) {
				break;
			}
			// load the array with the correct values
			this.props.question.responses.forEach((response) => {
				newAnswers[response.id] = this.props.question.tries[index][0][response.identifier];
			});
			// newAnswers = this.props.question.tries[index][0];
			// if they got full marks
			if (this.props.question.tries[index][2] && this.props.question.tries[index][1]) {
				break;
			}
		}
		// this.props.question.responses.forEach(response => {
		//     let answer;
		//     for ( const index in response.tries) {
		//         // reach not used try
		//         if (response.tries[index][0] === null) {
		//             break
		//         }

		//         // already correct answer MAY CAUSE PROBLEM grade > 0
		//         if (response.tries[index][2] && response.tries[index][1]) {
		//             answer = response.tries[index][0];
		//             break
		//         }

		//         answer = response.tries[index][0];

		//     }
		//     if (answer) {newAnswers[response.id] = answer;}
		// });
		this.setState({ answers: newAnswers });
	};

	// render question's tags
	renderTags = () => {
		return this.props.question.tags.map((tag) => (
			<Tag color={theme['@primary-color']}>{tag.name}</Tag>
		));
	};

	getStatus = (left, max, correct) => {
		if (max === left) return undefined;
		else if (correct) return 'success';
		else if (left > 0 && !correct) return 'warning';
		else if (left === 0) return 'error';
	};

	getBorder = () => {
		//this.getBorder(c.left_tries, c.grade_policy.max_tries, c.tries.filter((attempt)=>attempt[2] === true).length > 0);
		// let noSub = true;
		// let noLeft = 0;
		if (!this.props.status.correct) {
			return theme['@white'];
		}
		// Unanswered
		if (this.props.question.tries[0][1] === null) {
			return theme['@white'];
		}
		// 100% => Green
		if (this.props.question.grade >= 100) {
			return '#45ae41';
		}
		// No tries => Red
		if (this.props.question.left_tries === 0) {
			return '#e1211f';
		}
		// anything else => Yellow
		return '#c39019';
		// this.props.question.responses.forEach(resp => {
		//     if (resp.left_tries !== resp.grade_policy.max_tries){
		//         noSub = false;
		//     }
		//     if (resp.left_tries === 0){
		//         noLeft++;
		//     }
		// })
		// if (noSub) return theme["@white"];
		// else if ((this.props.question.grade/(this.props.question.mark||0)) >= 1) return "#45ae41";
		// else if (noLeft !== this.props.question.responses.length) return "#c39019";
		// else return "#e1211f";
	};

	getScore = (tries) => {
		let score;
		for (const index in tries) {
			if (tries[index][1] !== null) {
				score = tries[index][1];
			} else {
				return score;
			}
		}
		return score;
	};

	// NEED FIX MARK IS WRONG
	renderResponseTextLine = (c, color) => (
		<div style={{ marginTop: 6, marginBottom: 16 }}>
			<XmlRender noBorder={true} images={this.state.images}>
				{c.text}
			</XmlRender>
		</div>
	);

	getFeedback = (key) => {
		if (!this.props.options.hide_feedback && this.props.status.feedback) {
			return (this.props.question?.feedback?.[key] ?? []).map((f, i) => (
				<Tag key={i} color={'cyan'}>
					{f}
				</Tag>
			));
		}
	};

	/* render the question text embedding inputs */
	renderQuestionText = () => {
		const inputChange = (id, val) => {
			let answers = this.state.answers;
			if (id !== undefined) {
				answers[id] = val;
			}
			console.log(val);
			this.setState({ answers });
			this.props.buffer(id, val);
		};
		const disp_text =
			setTexEnvironment(
				this.props.question?.options,
				this.props.question?.latexPreamble ?? ''
			) + (this.props.question?.text ?? '');
		const disable =
			this.props.question.left_tries === 0 ||
			this.props.question.tries.filter((attempt) => attempt[2] === true).length > 0 ||
			this.props.closed;
		return (
			<div style={{ display: 'flex' }}>
				<Typography.Text>
					<XmlRender
						noBorder
						inline
						qid={this.props.question.id}
						responses={this.props.question.responses}
						disable={disable}
						answers={this.state.answers}
						onChange={inputChange}
						images={this.state.images}
						script={this.props.question?.variables?.value}
					>
						{disp_text}
					</XmlRender>
				</Typography.Text>
			</div>
		);
	};

	/* render the question response by type */
	renderComponents = () => {
		if (this.props.question.responses) {
			return this.props.question.responses.map((component, id) => {
				if (component.id === undefined) {
					component.id = id;
				}
				switch (component.type.name) {
					case 'multiple':
						if (component.type.dropdown) {
							let pattern =
								'<dbox[\\w "=]*id="' + component.identifier + '"[\\w /="]*>';
							let reg = new RegExp(pattern, 'g');
							if (this.props.question.text && this.props.question.text.match(reg)) {
								return <React.Fragment key={id} />;
							}
							return this.renderDropDown(component, id);
						}
						return this.renderMultiple(component, id);
					case 'sagecell':
						let sc_reg = new RegExp(
							'<Cell[\\w "=]*id="' + component.identifier + '"[\\w /="]*>',
							'g'
						);
						if (this.props.question.text && this.props.question.text.match(sc_reg)) {
							return <React.Fragment key={id} />;
						}
						return this.renderSageCell(component, id);
					case 'tree':
						let pattern = '<ibox[\\w "=]*id="' + component.identifier + '"[\\w /="]*>';
						let reg = new RegExp(pattern, 'g');
						if (this.props.question.text && this.props.question.text.match(reg)) {
							return <React.Fragment key={id} />;
						}
						return this.renderInput(component, id);
					case 'algebraic':
						return this.renderAlgebraic(component, id);
					case 'matrix':
						let matrix_pattern =
							'<mbox[\\w "=]*id="' + component.identifier + '"[\\w /="]*>';
						let matrix_reg = new RegExp(matrix_pattern, 'g');
						if (
							this.props.question.text &&
							this.props.question.text.match(matrix_reg)
						) {
							return <React.Fragment key={id} />;
						}
						return this.renderMatrix(component, id);
					default:
						return <span>Error Response</span>;
				}
			});
		} else return <Empty />;
	};

	/* render the input type response */
	renderInput = (c, id) => {
		let tip = '';
		if (c.type.patternfeedback) {
			tip = c.type.patternfeedback;
		} else {
			if (c.type.patterntype !== 'Custom') {
				tip = 'Your answer should be a';
				if (/^[aeiou].*/i.test(c.type.patterntype)) {
					tip += 'n';
				}
				tip += ' ' + c.type.patterntype;
			} else {
				tip = 'Your answer does not meet the format of the question';
			}
		}
		let pop_reg = new RegExp(c.type.pattern, c.type.patternflag);
		let pop_test =
			!this.state.answers[c.id] ||
			pop_reg.test(this.state.answers[c.id]) ||
			this.state.answers[c.id] === '';
		let embed_reg = new RegExp('<ibox[\\w "=]*id="' + c.identifier + '"[\\w /="]*>', 'g');
		if (embed_reg.test(c.text)) {
			if (embed_reg.test(this.props.question.text, 'g')) {
				message.error(
					'Ibox ' + c.identifier + ' is already embedded in the question text.'
				);
			} else {
				const inputChange = (id, val) => {
					let answers = this.state.answers;
					answers[c.id] = val;
					this.setState({ answers });
					this.props.buffer(c.id, answers[c.id]);
				};
				const disable =
					this.props.question.left_tries === 0 ||
					this.props.question.tries.filter((attempt) => attempt[2] === true).length > 0 ||
					this.props.closed;
				return (
					<div key={id} style={{ margin: 8 }}>
						<XmlRender
							noBorder
							inline
							qid={this.props.question.id}
							responses={this.props.question.responses}
							disable={disable}
							answers={this.state.answers}
							onChange={inputChange}
							images={this.state.images}
						>
							{c.text}
						</XmlRender>
					</div>
				);
			}
		}
		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
				}}
			>
				{this.renderResponseTextLine(c)}
				<Input.Group compact>
					<Tooltip id={c.identifier + '_tooltip'} title={tip} open={!pop_test}>
						<Input
							style={{ width: `${2 * c.type.size * 1.1}em` }}
							addonBefore={c.type.label}
							value={this.state.answers[c.id]?.value}
							disabled={
								this.props.question.left_tries === 0 ||
								this.props.question.tries.filter((attempt) => attempt[2] === true)
									.length > 0 ||
								this.props.closed
							}
							onChange={(e) => {
								let answers = this.state.answers;
								answers[c.id] = { ...answers[c.id], value: e.target.value };
								this.setState({ answers });
								this.props.buffer(c.id, answers[c.id]);
							}}
						/>
					</Tooltip>
					{c.type.hasUnits ? (
						<Input
							style={{ width: `${c.type.size * 1.1}em` }}
							value={this.state.answers[c.id]?.units}
							disabled={
								this.props.question.left_tries === 0 ||
								this.props.question.tries.filter((attempt) => attempt[2] === true)
									.length > 0 ||
								this.props.closed
							}
							onChange={(e) => {
								let units = e.target.value;
								let eunits = e.target.value;
								let answers = this.state.answers;
								try {
									eunits = unit('1 ' + units)
										.toSI()
										.toString();
								} catch {
									eunits = e.target.value;
								}
								answers[c.id] = { ...answers[c.id], units, eunits };
								this.setState({ answers });
								this.props.buffer(c.id, answers[c.id]);
							}}
						/>
					) : null}
					{c.type.hasUnits && <UnitsHelper />}
				</Input.Group>
				{c.type.hasUnits ? (
					<span style={{ color: 'red' }}>
						{getUnitString(this.state.answers[c.id]?.units)}
					</span>
				) : null}
			</div>
		);
	};

	/* render the input type response */
	renderAlgebraic = (c, id) => {
		let embed_reg = new RegExp('<ibox[\\w "=]*id="' + c.identifier + '"[\\w /="]*>', 'g');
		if (embed_reg.test(c.text)) {
			if (embed_reg.test(this.props.question.text, 'g')) {
				message.error(
					'Ibox ' + c.identifier + ' is already embedded in the question text.'
				);
			} else {
				const inputChange = (id, val) => {
					let answers = this.state.answers;
					answers[c.id] = val;
					this.setState({ answers });
					this.props.buffer(c.id, val);
				};
				const disable =
					this.props.question.left_tries === 0 ||
					this.props.question.tries.filter((attempt) => attempt[2] === true).length > 0 ||
					this.props.closed;
				return (
					<div key={id} style={{ margin: 8 }}>
						<XmlRender
							noBorder
							inline
							qid={this.props.question.id}
							disable={disable}
							responses={this.props.question.responses}
							answers={this.state.answers}
							onChange={inputChange}
							images={this.props.images}
						>
							{c.text}
						</XmlRender>
					</div>
				);
			}
		}
		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
				}}
			>
				<div style={{ margin: 4 }}>
					<XmlRender noBorder={true} images={this.props.images}>
						{c.text}
					</XmlRender>
				</div>
				<MathField
					keyboardContainer={'scilo_keyboard_container'}
					keyboards={c.type.keyboards}
					addonBefore={c.type.label}
					value={this.state.answers[c.id]}
					disabled={
						this.props.question.left_tries === 0 ||
						this.props.question.tries.filter((attempt) => attempt[2] === true).length >
							0 ||
						this.props.closed
					}
					onChange={(value) => {
						let answers = this.state.answers;
						answers[c.id] = value;
						this.setState({ answers });
						this.props.buffer(c.id, value);
					}}
				/>
			</div>
		);
	};

	/* render the multiple-dropdown type response */
	renderDropDown = (c, id) => {
		let dropdown;
		const Option = Select.Option;

		dropdown = (
			<Select
				mode={c.type.single ? 'default' : 'multiple'}
				style={{ width: '100%' }}
				value={this.state.answers[c.id]}
				onChange={(e) => {
					let answers = this.state.answers;
					answers[c.id] = e;
					this.setState({ answers });
					this.props.buffer(c.id, e);
				}}
				disabled={
					this.props.question.left_tries === 0 ||
					this.props.question.tries.filter((attempt) => attempt[2] === true).length > 0 ||
					this.props.closed
				}
			>
				{c.answers && // answers may be undefined
					c.answers.map((r) => (
						<Option key={r.id} value={r.id}>
							<XmlRender noBorder={true} images={this.state.images}>
								{r.text}
							</XmlRender>
						</Option>
					))}
			</Select>
		);

		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
				}}
			>
				<div>
					{this.renderResponseTextLine(c)}
					{dropdown}
				</div>
				{this.getFeedback(c.identifier)}
			</div>
		);
	};

	/* render the multiple-radio type response */
	renderMultiple = (c, id) => {
		let choices;

		const RadioGroup = Radio.Group;
		const CheckboxGroup = Checkbox.Group;

		const optionStyle = {
			display: 'block',
			lineHeight: '30px',
		};

		const uncheck = (r) => {
			let answers = this.state.answers;
			if (answers[c.id] === r) {
				delete answers[c.id];
				this.setState({ answers });
				this.props.buffer(c.id, undefined);
			}
		};

		// only one correct answer
		if (c.type.single) {
			choices = (
				<RadioGroup
					onChange={(e) => {
						let answers = this.state.answers;
						answers[c.id] = e.target.value;
						this.setState({ answers });
						this.props.buffer(c.id, e.target.value);
					}}
					value={this.state.answers[c.id]}
					disabled={
						this.props.question.left_tries === 0 ||
						this.props.question.tries.filter((attempt) => attempt[2] === true).length >
							0 ||
						this.props.closed
					}
				>
					{c.answers && // answer could be undefined
						c.answers.map((r) => (
							<Radio
								key={r.id}
								value={r.id}
								style={optionStyle}
								onClick={() => {
									uncheck(r.id);
								}}
							>
								<XmlRender inline noBorder={true} images={this.state.images}>
									{r.text}
								</XmlRender>
							</Radio>
						))}
				</RadioGroup>
			);
		}
		// multiple selection
		else {
			choices = (
				<CheckboxGroup
					value={this.state.answers[c.id]}
					disabled={
						this.props.question.left_tries === 0 ||
						this.props.question.tries.filter((attempt) => attempt[2] === true).length >
							0 ||
						this.props.closed
					}
					onChange={(e) => {
						let answers = this.state.answers;
						answers[c.id] = e;
						this.setState({ answers });
						this.props.buffer(c.id, e);
					}}
				>
					{c.answers &&
						c.answers.map((r, index) => (
							<Row key={index}>
								<Checkbox value={r.id} key={index}>
									<XmlRender noBorder={true} images={this.props.images}>
										{r.text}
									</XmlRender>
								</Checkbox>
							</Row>
						))}
				</CheckboxGroup>
			);
		}

		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
				}}
			>
				<div>
					{this.renderResponseTextLine(c)}
					{choices}
				</div>
				{this.getFeedback(c.identifier)}
			</div>
		);
	};

	renderSagecell = (c, id) => {
		const color = theme['@white'];
		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
					border: '2px solid',
					borderColor: color,
				}}
			>
				{this.renderResponseTextLine(c, color)}
				<FormItem
				//help="Be sure to run the codes first to save / submit it!"
				>
					<SageCell
						onChange={(cellInfo) => {
							this.props.buffer(c.id, cellInfo);
						}}
						src={c.type.src}
						language={c.type.language}
						params={c.type.params}
					>
						{this.state.answers[c.id] ? this.state.answers[c.id] : c.type.code}
					</SageCell>
				</FormItem>
			</div>
		);
	};

	/* render the matrix type response */
	renderMatrix = (c, id) => {
		let disp_matrix = (
			<>
				{Array(c.type.rows)
					.fill()
					.map((_, rowNum) => (
						<Row key={rowNum} wrap={false}>
							{Array(c.type.columns)
								.fill()
								.map((_, colNum) => (
									<Col span={24 / c.type.columns} key={colNum}>
										<span
											style={{
												size: c.type.size ? c.type.size * 1.1 : undefined,
												width: c.type.size ? c.type.size * 1.1 + 'em' : 75,
												paddingInline: '8px',
												display: 'inline-block',
											}}
										>
											<Input
												size="small"
												value={this.state.answers[c.id]?.[rowNum]?.[colNum]}
												disabled={
													this.props.question.left_tries === 0 ||
													this.props.question.tries.filter(
														(attempt) => attempt[2] === true
													).length > 0 ||
													this.props.closed
												}
												onChange={(e) => {
													let val = isNumeric(e.target.value)
														? parseFloat(e.target.value)
														: e.target.value;
													let answers = this.state.answers;
													if (answers[c.id]) {
														if (answers[c.id][rowNum]) {
															answers[c.id][rowNum][colNum] = val;
														} else {
															answers[c.id][rowNum] = Array(
																c.type.columns
															).fill(null);
															answers[c.id][rowNum][colNum] = val;
														}
													} else {
														answers[c.id] = Array.from(
															Array(c.type.rows),
															() => Array(c.type.columns).fill(null)
														);
														answers[c.id][rowNum][colNum] = val;
													}
													this.setState({ answers });
													this.props.buffer(c.id, answers[c.id]);
												}}
											/>
										</span>
									</Col>
								))}
						</Row>
					))}
			</>
		);
		const char = c?.type?.display?.[0]?.toUpperCase() ?? 'M';
		const delimiters = [
			`\\left${char}Delim\\vphantom{\\begin{matrix}${new Array(c.type.rows)
				.fill(0)
				.join(' \\\\ ')}\\end{matrix}}\\right.`,
			`\\left.\\vphantom{\\begin{matrix}${new Array(c.type.rows)
				.fill(0)
				.join(' \\\\ ')}\\end{matrix}}\\right${char}Delim`,
		];
		return (
			<div
				key={id}
				className="field_wrapper"
				style={{
					backgroundColor: theme['@white'],
				}}
			>
				<div>
					{this.renderResponseTextLine(c)}
					<Row wrap={false}>
						<Col span={1}>
							<XmlRender noBorder style={{ textAlign: 'right', paddingTop: '0.2em' }}>
								{`<m>${delimiters[0]}</m>`}
							</XmlRender>
						</Col>
						<Col span={Math.min(c.type.columns, 22)}>{disp_matrix}</Col>
						<Col span={1}>
							<XmlRender
								noBorder
								style={{ paddingLeft: '10px', paddingTop: '0.2em' }}
							>
								{`<m>${delimiters[1]}</m>`}
							</XmlRender>
						</Col>
					</Row>
				</div>
				{this.getFeedback(c.identifier)}
			</div>
		);
	};

	renderSolution = () => {
		if (this.props.question?.solution?.length) {
			return (
				<div style={{ display: 'flex' }}>
					<XmlRender>{this.props.question?.solution}</XmlRender>
				</div>
			);
		} else {
			return <></>;
		}
	};

	renderTryInfo = () => {
		const free = this.props.question.grade_policy.free_tries;
		const total_tries = this.props.question.grade_policy.max_tries;
		const completed_tries = this.props.question.tries.filter((aTry) => aTry[1]).length;
		const penalty = this.props.question.grade_policy.penalty_per_try;

		return (
			<Space direction="vertical" style={{ float: 'right', paddingRight: '8px' }}>
				{penalty !== 0 && !this.props.options.no_try_deduction && (
					<p>
						{Math.max(0, free - completed_tries) +
							' out of ' +
							free +
							' free tries remaining.'}
					</p>
				)}
				{total_tries !== 0 ? (
					<p>
						{Math.max(0, total_tries - completed_tries) +
							' out of ' +
							total_tries +
							' tries remaining.'}
					</p>
				) : (
					<p>You have unlimited tries.</p>
				)}
				{total_tries > 1 && penalty !== 0 && !this.props.options.no_try_deduction && (
					<p>
						{penalty +
							'% deduction per try after first ' +
							(free > 1 ? free + ' tries.' : 'try.')}
					</p>
				)}
			</Space>
		);
	};

	render() {
		const color = this.getBorder();
		return (
			<div>
				<Card
					type={'inner'}
					title={
						<QuestionStatsCollapse
							question={this.props.question}
							hide_feedback={this.props.options.hide_feedback}
							status={this.props.status}
						>
							<Typography.Title level={4} style={{ whiteSpace: 'normal' }}>
								{`${this.props.index + 1}. ${
									(this.props.options.hide_titles
										? ''
										: this.props.question.desc_as_title
										? this.props.question.descriptor
										: this.props.question.title) || ''
								}`}
							</Typography.Title>
						</QuestionStatsCollapse>
					}
					extra={
						this.props.status.marks && (
							<span>
								{`${
									this.props.question.grade
										? Number(
												(this.props.question.grade *
													this.props.question.mark) /
													100
										  ).toFixed(2)
										: 0
								} / ${this.props.question.mark}`}
							</span>
						)
					}
				>
					<FormItem
						help={<div style={{ paddingTop: '8px' }}>{this.getFeedback('end')}</div>}
					>
						<div
							style={{
								backgroundColor: theme['@white'],
								border: '2px solid',
								borderColor: color,
								padding: 6,
							}}
						>
							{this.renderQuestionText()}
							{this.props.question.responses &&
								this.props.question.responses.length > 0 && (
									<>
										<Divider
											style={{
												marginTop: '12px',
												marginBottom: '12px',
											}}
										/>
										{this.renderComponents()}
									</>
								)}
						</div>
					</FormItem>
					{this.renderSolution()}
					<Divider />
					{this.props.question.responses && this.props.question.responses.length > 0 && (
						<>
							<Button
								type="primary"
								ghost
								icon={<SaveOutlined />}
								onClick={this.props.save}
								loading={this.props.loading}
							>
								Save
							</Button>
							<Button
								type="danger"
								icon={<UploadOutlined />}
								onClick={this.props.submit}
								style={{ float: 'right' }}
								loading={this.props.loading}
							>
								Submit
							</Button>
							{this.renderTryInfo(this.props.question)}
						</>
					)}
				</Card>
			</div>
		);
	}
}

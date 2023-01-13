import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Col,
	Divider,
	Empty,
	Input,
	InputNumber,
	message,
	Radio,
	Row,
	Select,
	Skeleton,
	Space,
	Tag,
	Tooltip,
	Typography,
} from 'antd';
import { unit } from 'mathjs';
import React from 'react';
import theme from '../../config/theme';
import TestDecisionTree from '../../networks/TestDecisionTree';
import { UnitsHelper } from '../../utils/unitsHelper';
import TraceResult from '../DecisionTree/TraceResult';
import { clear_ibox_vis } from '../Editor/XmlConverter';
import XmlRender from '../Editor/XmlRender';
import MathField from '../MathLive/MathLiveField';
import SageCell from '../SageCell';
import './QuestionPreviews.css';
import QuestionStatsCollapse from './QuestionStatsCollapse';
import { isNumeric, setTexEnvironment } from './sharedFrame';

/* Preview Component */
export default class OfflineFrame extends React.Component {
	state = {
		results: undefined,
		loading: false,
		grade: '',
		highestWeight: 0,
		answers: {},
	};

	// test decision tree
	test = () => {
		if (this.state.loading) {
			return;
		}
		this.setState({
			results: undefined,
			loading: true,
		});
		// associate the identifier of each box with its entered value
		let inputs = {};
		for (var i = 0; i < this.props.question.responses.length; i++) {
			inputs[this.props.question.responses[i].identifier] = {
				value: this.state.answers[this.props.question.responses[i].id] || null,
				type: this.props.question.responses[i].type.name,
				mults: this.props.question.responses[i].answers,
				blockedOps: this.props.question.responses[i].type.blockedOps || [],
				hasUnits: this.props.question.responses[i].type.hasUnits || false,
			};
		}

		const sending = {
			input: inputs,
			tree: this.props.question.tree,
			full: false,
			args: {
				script: this.props.question.variables ? this.props.question.variables : undefined,
				offline: true,
				seed: this.props.temp_seed || this.props.question.id || 10,
			},
		};
		console.log('sending', sending);
		TestDecisionTree(sending, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error('Submit failed, see browser console for more details.');
				this.setState({ loading: false });
				console.error(data);
			} else {
				this.setState({
					results: data.data,
					loading: false,
				});
			}
		});
	};

	getFeedback = (key) => {
		return (this.state?.results?.feedback?.[key] ?? []).map((f, i) => {
			return (
				<Tag key={i} color={'cyan'}>
					<XmlRender noBorder inline script={this.props?.question?.variables?.value}>
						{f || ''}
					</XmlRender>
				</Tag>
			);
		});
	};

	/* render the question text embedding inputs */
	renderQuestionText = () => {
		const inputChange = (e, o) => {
			var val = undefined;
			var id = undefined;
			let answers = this.state.answers;
			for (var i = 0; i < this.props.question.responses.length; i++) {
				if (this.props.question.responses[i].identifier === (e?.target?.id ?? o.key)) {
					id = this.props.question.responses[i].id || i;
					if (e.target) {
						val = e.target.value;
					} else {
						val = e;
					}
				}
			}
			if (id !== undefined) {
				answers[id] = val;
			}
			this.setState({ answers });
		};
		let disp_text =
			setTexEnvironment(
				this.props.question?.options,
				this.props.question?.latexPreamble ?? ''
			) + (this.props.question?.text ?? '');
		return (
			<div style={{ display: 'flex' }}>
				<XmlRender
					noBorder
					qid={this.props.question.id}
					responses={this.props.question.responses}
					answers={this.state.answers}
					onChange={inputChange}
					images={this.props.images}
					script={this.props.question?.variables?.value}
				>
					{disp_text}
				</XmlRender>
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
						let ib_reg = new RegExp(pattern, 'g');
						if (this.props.question.text && this.props.question.text.match(ib_reg)) {
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

	getUnitString = (units) => {
		if (!units) return null;
		let out;
		if (/^\s*\d/.test(units)) {
			out = 'Units cannot begin with a number.';
		} else {
			try {
				out = unit(units).toSI().toString();
			} catch {
				out = 'Invalid unit string';
			}
		}
		return out;
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
			!this.state.answers[c.id]?.value ||
			pop_reg.test(this.state.answers[c.id]?.value) ||
			this.state.answers[c.id]?.value === '';
		let embed_reg = new RegExp('<ibox[\\w "=]*id="' + c.identifier + '"[\\w /="]*>', 'g');
		if (embed_reg.test(c.text)) {
			if (embed_reg.test(this.props.question.text, 'g')) {
				message.error(
					'Ibox ' + c.identifier + ' is already embedded in the question text.'
				);
			} else {
				const inputChange = (e) => {
					let answers = this.state.answers;
					answers[c.id].value = e.target.value;
					this.setState({ answers });
				};
				return (
					<div key={id} style={{ margin: 8 }}>
						<XmlRender
							noBorder
							inline
							qid={this.props.question.id}
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
				<Input.Group compact>
					<Tooltip id={c.identifier + '_tooltip'} title={tip} open={!pop_test}>
						<Input
							style={{ width: `${2 * c.type.size * 1.1}em` }}
							addonBefore={c.type.label}
							value={this.state.answers[c.id]?.value}
							onChange={(e) => {
								let answers = this.state.answers;
								answers[c.id] = { ...answers[c.id], value: e.target.value };
								this.setState({ answers });
							}}
						/>
					</Tooltip>
					{c.type.hasUnits ? (
						<Input
							style={{ width: `${c.type.size * 1.1}em` }}
							value={this.state.answers[c.id]?.units}
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
							}}
						/>
					) : null}
					{c.type.hasUnits && <UnitsHelper />}
				</Input.Group>
				{c.type.hasUnits ? (
					<span style={{ color: 'red' }}>
						{this.getUnitString(this.state.answers[c.id]?.units)}
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
				const inputChange = (e) => {
					let answers = this.state.answers;
					answers[c.id] = e.target.value;
					this.setState({ answers });
				};
				return (
					<div key={id} style={{ margin: 8 }}>
						<XmlRender
							noBorder
							inline
							qid={this.props.question.id}
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
					onChange={(value) => {
						let answers = this.state.answers;
						answers[c.id] = value;
						this.setState({ answers });
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
				}}
			>
				{c.answers && // answers may be undefined
					c.answers.map((r, index) => (
						<Option key={index} value={r.text}>
							<XmlRender noBorder={true} images={this.props.images}>
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
					<div style={{ margin: 4 }}>
						<XmlRender noBorder={true} images={this.props.images}>
							{c.text}
						</XmlRender>
					</div>
					{dropdown}
				</div>
				{this.getFeedback(c.identifier)}
			</div>
		);
	};

	/* render the multiple-normal type response */
	renderMultiple = (c, id) => {
		let choices;

		const RadioGroup = Radio.Group;
		const CheckboxGroup = Checkbox.Group;

		const optionStyle = {
			display: 'block',
			lineHeight: '30px',
		};

		// only one correct answer
		if (c.type.single) {
			choices = (
				<RadioGroup
					onChange={(e) => {
						let answers = this.state.answers;
						answers[c.id] = e.target.value;
						this.setState({ answers });
					}}
					value={this.state.answers[c.id]}
				>
					{c.answers && // answer could be undefined
						c.answers.map((r, index) => (
							<Radio key={index} value={r.text} style={optionStyle}>
								<XmlRender inline={true} noBorder={true} images={this.props.images}>
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
					onChange={(e) => {
						let answers = this.state.answers;
						answers[c.id] = e;
						this.setState({ answers });
					}}
				>
					{c.answers &&
						c.answers.map((r, index) => (
							<Row key={index}>
								<Checkbox value={r.text} key={index}>
									<XmlRender
										inline={true}
										noBorder={true}
										images={this.props.images}
									>
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
					<XmlRender noBorder={true} images={this.props.images}>
						{c.text}
					</XmlRender>
					{choices}
				</div>
				{this.getFeedback(c.identifier)}
			</div>
		);
	};

	/* render the input type response */
	renderSageCell = (c, id) => {
		let code;
		if (c.type.inheritScript) {
			code = this.props.question.variables.value + '\n' + c.type.code;
		} else {
			code = c.type.code;
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
					<XmlRender snoBorder={true} images={this.props.images}>
						{c.text}
					</XmlRender>
				</div>
				<SageCell
					src={c.type.src}
					language={c.type.language}
					params={c.type.params}
					script={code}
				/>
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
					<XmlRender noBorder images={this.props.images}>
						{c.text}
					</XmlRender>
					<Row wrap={false}>
						<Col span={1}>
							<XmlRender noBorder style={{ textAlign: 'right', paddingTop: '0.2em' }}>
								{`<m>${delimiters[0]}</m>`}
							</XmlRender>
						</Col>
						<Col span={Math.min(2 * c.type.columns, 22)}>{disp_matrix}</Col>
						<Col span={1}>
							<XmlRender
								noBorder
								style={{ textAlign: 'center', paddingTop: '0.2em' }}
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

	fillValues = () => {
		let answers = this.state.answers;
		let filling = {};
		for (var i = 0; i < this.props.question.responses.length; i++) {
			let field = this.props.question.responses[i];
			if (field.type.name === 'multiple') {
				if (field.type.single) {
					let max_text = '';
					let max_score = 0;
					for (let j = 0; j < field.answers.length; j++) {
						if (field.answers[j].grade > max_score) {
							max_text = field.answers[j].text;
							max_score = field.answers[j].grade;
						}
					}
					answers[field.id] = max_text;
				} else {
					let ans = [];
					for (let j = 0; j < field.answers.length; j++) {
						if (field.answers[j].grade > 0) {
							ans.push(field.answers[j].text);
						}
					}
					answers[field.id] = ans;
				}
			} else if (field.type.name === 'tree') {
				if (field.type?.correct?.length) {
					filling[field.id] = field.type?.correct ?? '';
				}
			}
		}
		clear_ibox_vis(this.props.question.id);
		this.props.getSolutionValues(filling).then((fill) => {
			answers = { ...answers, ...fill };
			this.setState({ answers: answers });
		});
	};

	render() {
		return (
			<div>
				<Card
					type={'inner'}
					title={
						<QuestionStatsCollapse question={this.props.question}>
							<Typography.Title level={4} style={{ whiteSpace: 'normal' }}>
								{this.props.question.desc_as_title
									? this.props.question.descriptor
									: this.props.question.title}
							</Typography.Title>
						</QuestionStatsCollapse>
					}
					extra={
						<span>
							{`${Number(this.state.results ? this.state.results.score : 0).toFixed(
								2
							)} / ${this.props.question.mark || 0}`}
						</span>
					}
				>
					{this.props.question && this.renderQuestionText()}
					{this.props.question.responses && this.props.question.responses.length > 0 && (
						<>
							<Divider
								style={{
									marginTop: '12px',
									marginBottom: '12px',
								}}
							/>
							{this.renderComponents()}
							<Skeleton loading={this.state.loading} active>
								{!!this.state.results && (
									<div>
										<Divider orientation={'left'}>Result</Divider>
										Solution:{' '}
										<XmlRender
											script={this.props?.question?.variables?.value}
											style={{
												margin: '5px',
												padding: '5px',
											}}
										>
											{this.props.question?.solution ?? ''}
										</XmlRender>
										Your score:{' '}
										<Tag color={'orange'}>
											{Number(this.state.results.score).toFixed(2)}
										</Tag>
										<br />
										Your feedback: {this.getFeedback('end')}
										<br />
										Your Trace:
										<br />
										<TraceResult data={this.state.results.trace} />
										Timing:
										<blockquote>{this.state.results.time}</blockquote>
									</div>
								)}
							</Skeleton>
							<Divider />
							<Space>
								<Button icon={<UploadOutlined />} onClick={this.test}>
									Test
								</Button>
								<InputNumber
									style={{ width: '10em' }}
									addonBefore="Seed"
									max={10000}
									min={1}
									value={this.props.temp_seed}
									onChange={this.props.updateSeed}
								></InputNumber>
								<Button icon={<DownloadOutlined />} onClick={this.props.loadVars}>
									Regenerate Variables
								</Button>
								<Button icon={<DownloadOutlined />} onClick={this.fillValues}>
									Fill correct answers
								</Button>
							</Space>
						</>
					)}
				</Card>
			</div>
		);
	}
}

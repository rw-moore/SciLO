import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Col, Divider, message, Row, Tooltip } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { clear_ibox_vis } from '../../components/Editor/XmlConverter';
import CreateQuizForm from '../../components/Forms/CreateQuizForm';
import OfflineFrame from '../../components/QuestionPreviews/OfflineFrame';
import API from '../../networks/Endpoints';
import GetCourses from '../../networks/GetCourses';
import GetQuestionById from '../../networks/GetQuestionById';
import GetQuestionSolutionValues from '../../networks/GetQuestionSolutionValues';
import GetQuestionWithVars from '../../networks/GetQuestionWithVars';
import GetQuizById from '../../networks/GetQuizById';

/**
 * Page for create / modify a quiz
 */
class CreateQuiz extends React.Component {
	state = {
		questions: {},
		var_questions: {},
		fetched: {},
		seeds: {},
		order: [],
		preview: true,
		preview_keys: {},
		courses: {},
	};

	componentDidMount() {
		if (this.props.id) {
			this.fetch();
		}
		this.fetchQuestions(this.props.questions);
	}

	fetch = () => {
		GetQuizById(this.props.id, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					`Cannot fetch quiz ${this.props.id}, see browser console for more details.`
				);
				console.error('FETCH_FAILED', data);
			} else {
				const quiz = data.data;
				const questions = {};
				const order = [];
				const var_questions = {};
				const preview_keys = {};
				quiz.questions.forEach((question) => {
					question.question_image = question.question_image.map((file) => ({
						...file,
						url: API.domain + '/api' + file.url,
					}));
					questions[question.id] = question;
					var_questions[question.id] = {};
					order.push(question.id);
					preview_keys[question.id] = 1;
				});
				// console.log('fetch', data.data);
				this.setState(
					{
						fetched: data.data,
						questions: questions,
						order: order,
						var_questions: var_questions,
					},
					() => {
						quiz.questions.forEach((question) => {
							this.fetchWithVariables(question.id);
						});
					}
				);
			}
		});
		GetCourses(this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error('Cannot fetch courses, see browser console for more details.');
			} else {
				this.setState({ courses: data.data });
			}
		});
	};

	fetchQuestions = (questions) => {
		if (!questions) {
			return;
		}
		questions.forEach((id) => {
			GetQuestionById(id, this.props.token).then((data) => {
				if (!data || data.status !== 200) {
					message.error(
						`Cannot fetch question ${this.props.id}, see browser console for more details.`
					);
					console.error('FETCH_FAILED', data);
				} else {
					const questions = this.state.questions;
					questions[id] = data.data.question;
					questions[id].question_image = questions[id].question_image.map((file) => ({
						...file,
						url: API.domain + '/api' + file.url,
					}));
					const keys = this.state.preview_keys;
					keys[id] = 0;
					this.setState(
						{
							questions: questions,
							order: this.state.order.includes(id)
								? this.state.order
								: this.state.order.concat(id),
							preview_keys: keys,
						},
						() => {
							this.fetchWithVariables(id);
						}
					);
				}
			});
		});
	};

	fetchWithVariables = (id) => {
		GetQuestionWithVars(this.state.questions[id], this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					`Error occured while trying to substitute variables, see browser console for more details.`,
					7
				);
				console.error('FETCH_FAILED', data);
				this.setState({
					loading: false,
				});
			} else {
				if (data.data.error) {
					message.error(data.data.error);
				}
				let question = data.data.question;
				const var_questions = this.state.var_questions;
				var_questions[id] = question;
				const seeds = this.state.seeds;
				seeds[id] = data.data.temp_seed;
				const keys = this.state.preview_keys;
				keys[id] = keys[id] + 1;
				clear_ibox_vis(question.id);
				this.setState({
					var_questions: var_questions,
					seeds,
					preview_keys: keys,
				});
			}
		});
	};

	fetchWithSolutionVars = (id, fill) => {
		return GetQuestionSolutionValues(
			{
				question: this.state.questions[id],
				filling: fill,
				seed: this.state.seeds[id],
			},
			this.props.token
		).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					`Error occured while trying to fill correct answers, see browser console for more details.`,
					7
				);
				console.error('FETCH_FAILED', data);
				this.setState({ loading: false });
			} else {
				if (data.data.error) {
					message.error(data.data.error);
				}
				let vals = data.data.filling;
				return vals;
			}
		});
	};

	setOrder = (order) => {
		this.setState({ order: order });
	};

	update = (ids) => {
		const filteredOldIds = this.state.order.filter((id) => ids.includes(id)); // may have removed some old questions
		this.setState({ order: filteredOldIds });
		this.fetchQuestions(ids);
	};

	delete = (id) => {
		const questions = this.state.questions;
		questions[id] = undefined;
		this.setState({
			order: this.state.order.filter((item) => item !== id),
			questions: questions,
		});
	};

	render() {
		const colResponsive = {
			xs: 24,
			sm: 24,
			md: 24,
			lg: 24,
			xl: this.state.preview ? 12 : 24,
		};

		const divider = {
			xs: 24,
			sm: 24,
			md: 24,
			lg: 24,
			xl: 0,
		};

		const previewIcon = (
			<Tooltip title={this.state.preview ? 'hide preview' : 'show preview'}>
				{this.state.preview ? (
					<EyeInvisibleFilled
						style={{ float: 'right' }}
						onClick={() => {
							this.setState({ preview: !this.state.preview });
						}}
					/>
				) : (
					<EyeFilled
						style={{ float: 'right' }}
						onClick={() => {
							this.setState({ preview: !this.state.preview });
						}}
					/>
				)}
			</Tooltip>
		);

		return (
			<Row gutter={8}>
				<Col {...colResponsive} style={{ overflowY: 'hidden' }}>
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
							{this.props.id ? 'Edit Quiz' : 'New Quiz'}{' '}
							{!this.state.preview && previewIcon}
						</h1>
						{((this.props.id && Object.keys(this.state.fetched).length) ||
							!this.props.id) && (
							<CreateQuizForm
								course={this.props.course}
								token={this.props.token}
								goBack={this.props.history.goBack}
								fetched={this.state.fetched}
								questions={this.state.questions}
								setOrder={this.setOrder}
								order={this.state.order}
								delete={this.delete}
								update={this.update}
								keys={Object.keys(this.state.questions)}
								courseList={this.state.courses}
							/>
						)}
					</div>
				</Col>
				{this.state.preview && (
					<>
						<Col {...divider}>
							<div>
								<Divider />
							</div>
						</Col>
						<Col {...colResponsive} style={{ overflowY: 'hidden' }}>
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
									Preview
									{previewIcon}
								</h1>
								{this.state.questions &&
									this.state.order.map((id) => (
										<span key={id} style={{ margin: 16 }}>
											<OfflineFrame
												key={this.state.preview_keys[id]}
												question={
													this.state.var_questions[id] ??
													this.state.questions[id]
												}
												token={this.props.token}
												loadVars={() => this.fetchWithVariables(id)}
												getSolutionValues={(fill) =>
													this.fetchWithSolutionVars(id, fill)
												}
												images={this.state.questions[id].question_image}
												temp_seed={this.state.seeds[id]}
											/>
										</span>
									))}
								{/* {questions.map(question => (
                                <span key={question.title} style={{margin: 16}}>
                                    <OfflineFrame
                                        question={question}/>
                                </span>
                            ))} */}
							</div>
						</Col>
					</>
				)}
			</Row>
		);
	}
}

export default withRouter(CreateQuiz);

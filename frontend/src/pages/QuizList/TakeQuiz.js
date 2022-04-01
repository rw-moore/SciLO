import {
	Alert,
	Button,
	Descriptions,
	Divider,
	Form,
	message,
	Modal,
	Spin,
	Typography,
} from 'antd';
import moment from 'moment';
import React from 'react';
import { withRouter } from 'react-router-dom';
import QuestionFrame from '../../components/QuestionPreviews/QuestionFrame';
import QuestionScoreTable from '../../components/QuizCard/QuestionScoreTable';
import GetQuizAttempt from '../../networks/GetQuizAttempt';
import PostQuizAttempt from '../../networks/PostQuizAttempt';

class TakeQuiz extends React.Component {
	state = {
		buffer: [],
		lastSaved: null,
	};

	updateTime = () => {
		this.setState({
			reminderTime: moment(this.state.lastSaved).fromNow(),
		});
	};

	writeToBuffer = (questionId, responseId, answer) => {
		let buffer = this.state.buffer;
		const questionIndex = buffer.findIndex(
			(question) => questionId === question.id
		);
		if (questionIndex === -1) {
			buffer.push({
				id: questionId,
				responses: [{ id: responseId, answer: answer }],
			});
		} else {
			const responseIndex = buffer[questionIndex].responses.findIndex(
				(response) => responseId === response.id
			);
			if (responseIndex === -1) {
				buffer[questionIndex].responses.push({
					id: responseId,
					answer: answer,
				});
			} else {
				buffer[questionIndex].responses[responseIndex].answer = answer;
			}
		}
		this.setState({
			buffer: buffer,
		});
	};

	getSavedValues = (questions) => {
		let buffer = [];
		questions.forEach((question) => {
			let responses = [];
			for (let attempt = 0; attempt < question.tries.length; attempt++) {
				if (
					question.tries[attempt][0] !== null &&
					question.tries[attempt + 1] &&
					question.tries[attempt + 1][0] === null
				) {
					for (let i = 0; i < question.responses.length; i++) {
						responses.push({
							id: question.responses[i].id,
							answer: question.tries[attempt][0][
								question.responses[i].identifier
							],
						});
					}
				}
			}
			if (responses.length) {
				buffer.push({ id: question.id, responses: responses });
			}
		});
		return buffer;
	};

	afterSubmit = (data, saved) => {
		if (!data || data.status !== 200) {
			if (data?.data?.message) {
				message.error(data.data.message);
			} else {
				message.error(
					'Cannot submit / save quiz, see browser console for more details.'
				);
			}
			if (data?.status === 307) {
				this.props.history.goBack();
			} else {
				this.setState({
					loading: false,
				});
			}
		} else {
			if (saved) {
				message.success('Saved Quiz successfully.', 1);
			}
			this.setState({
				loading: false,
				quiz: data.data.quiz,
				lastSaved: data.data?.last_saved_date,
				reminderTime: moment(data.data.last_saved_date).fromNow(),
			});
			if (this.interval) {
				clearInterval(this.interval);
			}
			setInterval(this.updateTime, 60000);
		}
	};

	save = (auto = false) => {
		const submission = {
			submit: false,
			questions: this.state.buffer,
		};

		PostQuizAttempt(this.props.id, submission, this.props.token).then(
			(data) => this.afterSubmit(data, true)
		);
	};

	checkTries = (buffer_question) => {
		let done = true;
		this.state.quiz.questions.forEach((question) => {
			if (buffer_question.id === question.id) {
				question.tries.forEach((onetry) => {
					if (onetry[2]) {
						done = false;
						return;
					}
					if (onetry[0] !== null) {
						let different = [];
						buffer_question.responses.forEach((res) => {
							question.responses.forEach((qresp) => {
								if (qresp.id === res.id) {
									different.push(
										onetry[0][qresp.identifier] ===
											res.answer
									);
								}
							});
						});
						if (different.every(Boolean)) {
							done = false;
							return;
						}
					}
				});
			}
			if (!done) return;
		});
		return done;
	};

	// Check if the user's answers conform to the patterns before submit
	submitCheck = (id, other) => {
		if (this.state.closed) {
			message.error('You have already started a new attempt.');
			return;
		}
		const checkRegex = (id) => {
			let buffer = this.state.buffer;
			const questionIndex = buffer.findIndex(
				(question) => question.id === id
			);
			let question = this.state.quiz.questions.find(
				(question) => question.id === id
			);
			if (questionIndex === -1) {
				return false;
			} else {
				for (let i = 0; i < question.responses.length; i++) {
					let resp = question.responses[i];
					const responseIndex = buffer[
						questionIndex
					].responses.findIndex(
						(response) => response.id === resp.id
					);
					if (responseIndex === -1) {
						return false;
					} else {
						let ans =
							buffer[questionIndex].responses[responseIndex]
								.answer;
						if (resp.pattern) {
							let reg = new RegExp(
								resp.pattern,
								resp.patternflag
							);
							if (!ans || !reg.test(ans) || ans === '') {
								return false;
							}
						} else if (!ans || ans === '') {
							return false;
						}
					}
				}
			}
			return true;
		};
		if (id !== undefined) {
			if (checkRegex(id)) {
				this.submitQuestion(id);
			} else {
				Modal.warning({
					title: 'Submit',
					content: (
						<span>
							Are you sure you want to submit? Some of your
							answers are empty or do not match their intended
							type
						</span>
					),
					onOk: () => this.submitQuestion(id),
					okCancel: true,
				});
			}
		} else {
			for (let i = 0; i < this.state.quiz.questions.length; i++) {
				if (!checkRegex(this.state.quiz.questions[i].id)) {
					Modal.warning({
						title: 'Submit',
						content: (
							<span>
								Are you sure you want to submit? Some of your
								answers are empty or do not match their intended
								type
							</span>
						),
						onOk: () => this.submit(),
						okCancel: true,
					});
					return;
				}
			}
			this.submit();
		}
	};

	submitQuestion = (id) => {
		// prohibit empty answer
		let buffer = this.state.buffer;
		buffer = buffer.filter((question) => question.id === id);

		buffer.forEach((question) => {
			if (question.id === id) {
				question.responses = question.responses.filter(
					(response) => response.answer && response.answer.length > 0
				);
			}
		});

		buffer = buffer.filter((question) => question.responses.length > 0);
		if (buffer.length === 0) {
			message.error('Cannot submit nothing.');
			return;
		}
		buffer = buffer.filter((question) => this.checkTries(question));
		if (buffer.length === 0) {
			message.error('Cannot submit an identical question.');
			return;
		}
		// buffer.forEach(question => {
		//     if (question.id === id) {
		//         question.responses.forEach(response => {
		//             if (!response.answer) {
		//                 if (emptyCells[question.id]) {
		//                     emptyCells[question.id] = [...emptyCells[question.id], response.id]
		//                 } else {
		//                     emptyCells[question.id] = [response.id]
		//                 }
		//             }
		//         })
		//     }
		// });

		// if (Object.keys(emptyCells).length > 0) {
		//     message.error("Cannot submit empty answers!");
		//     return false
		// }

		// parse submission data
		const submission = {
			submit: true,
			questions: buffer,
		};

		PostQuizAttempt(this.props.id, submission, this.props.token).then(
			this.afterSubmit
		);
	};

	submit = () => {
		// prohibit empty answer
		let buffer = this.state.buffer;

		buffer.forEach((question) => {
			question.responses = question.responses.filter(
				(response) => response.answer && response.answer.length > 0
			);
		});

		buffer = buffer.filter((question) => question.responses.length > 0);
		if (buffer.length === 0) {
			message.error('Cannot submit nothing.');
			return;
		}
		buffer = buffer.filter((question) => this.checkTries(question));
		if (buffer.length === 0) {
			message.error('Cannot submit an identical quiz.');
			return;
		}

		// parse submission data
		const submission = {
			submit: true,
			questions: this.state.buffer,
		};

		PostQuizAttempt(this.props.id, submission, this.props.token).then(
			this.afterSubmit
		);
	};

	componentDidMount() {
		this.fetch(this.props.id);

		// auto-save every 60s
		// setInterval(()=>{
		//     this.save(true);
		// }, 60000)
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	fetch = (params = {}) => {
		this.setState({ loading: true });
		GetQuizAttempt(this.props.id, this.props.token, params).then((data) => {
			if (!data || data.status !== 200) {
				if (data?.data?.message) {
					message.error(data.data.message);
				} else {
					message.error(
						'Cannot fetch quiz, see browser console for more details.'
					);
				}
				this.setState({
					loading: false,
				});
			} else {
				this.setState({
					loading: false,
					quiz: data.data?.quiz,
					buffer: this.getSavedValues(
						data.data?.quiz?.questions ?? []
					),
					closed: data.data?.closed,
					review_status: data.data?.status,
					lastSaved: data.data?.last_saved_date,
				});
				if (data.data.last_saved_date) {
					this.setState({
						reminderTime: moment(
							data.data.last_saved_date
						).fromNow(),
					});
					this.interval = setInterval(this.updateTime, 60000);
				}
			}
		});
	};

	render() {
		return (
			<div
				className={'TakeQuiz'}
				style={{ padding: '0px 64px 64px 64px' }}
			>
				{this.state.quiz ? (
					<>
						<Typography.Title level={2}>
							{this.state.quiz.title}
						</Typography.Title>
						<Descriptions
							title="Quiz Info"
							//bordered
							column={{
								xxl: 3,
								xl: 2,
								lg: 1,
								md: 1,
								sm: 1,
								xs: 1,
							}}
						>
							<Descriptions.Item label="Author">
								{this.state.quiz.author}
							</Descriptions.Item>
							<Descriptions.Item label="Status">
								{this.state.quiz.status}
							</Descriptions.Item>
							<Descriptions.Item label="Grade">
								{this.state.quiz.grade
									? Math.round(this.state.quiz.grade * 100) +
									  '%'
									: undefined}
							</Descriptions.Item>
							<Descriptions.Item label="Bonus">
								{this.state.quiz.bonus}
							</Descriptions.Item>
							<Descriptions.Item label="Start">
								{moment
									.utc(this.state.quiz.start_date)
									.format('llll')}
							</Descriptions.Item>
							{this.state.quiz.end_date !== null && (
								<Descriptions.Item label="End">
									{moment
										.utc(this.state.quiz.end_date)
										.format('llll')}
								</Descriptions.Item>
							)}
							<Descriptions.Item label="Last Modified" span={3}>
								{moment
									.utc(this.state.quiz.last_modified_date)
									.format('llll')}
							</Descriptions.Item>
							{this.state.review_status.marks && (
								<Descriptions.Item label="Questions" span={3}>
									<br />
									<QuestionScoreTable
										questions={this.state.quiz.questions}
									/>
								</Descriptions.Item>
							)}
						</Descriptions>
						<Divider />
						<Form>
							{this.state.quiz &&
								this.state.quiz.questions &&
								this.state.quiz.questions.map(
									(question, index) => (
										<span
											key={question.id}
											style={{ margin: 12 }}
										>
											<QuestionFrame
												loading={this.state.loading}
												closed={this.state.closed}
												question={question}
												options={
													this.state.quiz.options
												}
												index={index}
												status={
													this.state.review_status
												}
												buffer={(responseId, answer) =>
													this.writeToBuffer(
														question.id,
														responseId,
														answer
													)
												}
												save={this.save}
												submit={() => {
													this.submitCheck(
														question.id
													);
												}}
											/>
										</span>
									)
								)}
						</Form>
						<Divider />
						{this.state.reminderTime && (
							<span>
								Last saved at: {this.state.reminderTime}
							</span>
						)}
						<Button
							type={'danger'}
							style={{ float: 'right' }}
							onClick={() => {
								this.submitCheck();
							}}
						>
							Submit All Answers
						</Button>
					</>
				) : this.state.loading ? (
					<div style={{ textAlign: 'center' }}>
						<Spin size="large" />
					</div>
				) : (
					<>
						<Alert
							style={{ width: '75%', marginLeft: '12.5%' }}
							message="Error"
							description="The quiz you requested cannot be viewed at this time."
							type="error"
							showIcon
						/>
					</>
				)}
			</div>
		);
	}
}

export default withRouter(TakeQuiz);

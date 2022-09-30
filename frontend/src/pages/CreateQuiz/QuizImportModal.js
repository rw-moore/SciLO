import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, message, Modal, Radio, Upload } from 'antd';
import React, { useState } from 'react';
// import UploadQuestions from "../../utils/UploadQuestions";
import GetQuestionById from '../../networks/GetQuestionById';
import PostQuestion from '../../networks/PostQuestion';
import PostQuiz from '../../networks/PostQuiz';

export default function QuizImportModal(props) {
	const [visible, setVisible] = useState(false);
	const [method, setMethod] = useState(1);
	const [copy, setCopy] = useState(false);
	const [quizzes, setQuizzes] = useState({});
	const [loading, setLoading] = useState(false);

	// uid is file-id
	const addQuiz = (uid, quiz) => {
		const _quizzes = quizzes;
		_quizzes[uid] = quiz;
		setQuizzes(_quizzes);
	};

	const removeQuiz = (uid) => {
		const _quizzes = quizzes;
		delete _quizzes[uid];
		setQuizzes(_quizzes);
	};

	let explain;
	switch (method) {
		case 0:
			explain =
				"Don't import any questions, only using the exact ids from quiz.";
			break;
		case 1:
			explain =
				'Matched questions in the database with same id & title will not be imported.';
			break;
		case 2:
			explain = 'Always import and upload question data from the file.';
			break;
		default:
			explain = '';
			break;
	}

	let explain2;
	switch (method) {
		case 0:
			explain2 = 'You will not get a copy in your questionbank.';
			break;
		case 1:
			explain2 =
				'Only question does not match will generate a copy in your questionbank.';
			break;
		case 2:
			explain2 =
				'You will receive a copy of all questions from the quiz in your questionbank.';
			break;
		default:
			explain2 = '';
			break;
	}

	const loadFile = (file, fileList) => {
		const fileReader = new FileReader();
		fileReader.onload = (() => {
			return (e) => {
				try {
					const data = JSON.parse(e.target.result);
					addQuiz(file.uid, data);
				} catch (ex) {
					message.error('Exception when trying to parse json: ' + ex);
				}
			};
		})(file);
		fileReader.readAsText(file);

		return false; // must be false to upload manually
	};

	const removeFile = (file) => {
		removeQuiz(file.uid);
		return true;
	};

	const onOk = () => {
		setLoading(true);
		const quizPromises = [];
		Object.values(quizzes).forEach((quiz) => {
			quiz = quiz.quiz;

			const promises = [];
			if (method !== 0) {
				// post the question first
				const post = (question) => {
					// by backend logic, if the course of a question is undefined, when create a quiz based on such question, it will generate a copy
					// to be that question with course info, so the original question will remain in the users questionbank.
					// if we want to make a copy in user questionbank, we just simply remove course info in the question below.
					// else we keep the course info, and the backend will not create a copy with the course info.
					question.course = !copy ? props.course : undefined;

					question.id = undefined;
					question.owner = undefined;
					question.quizzes = undefined;
					question.responses.forEach((response) => {
						response.question = undefined;
					});
					question.tags.forEach((tag) => {
						tag.id = undefined;
					});
					return postQuestion(question).then((data) => {
						question.id = data.data.question.id;
					}); // change id to new id
				};

				quiz.questions.forEach((question) => {
					if (method === 1) {
						// check if question id exist
						const temp = new Promise(function (resolve, reject) {
							GetQuestionById(question.id, props.token).then(
								(data) => {
									if (!data || data.status !== 200) {
										// no or lack of perms
										resolve(post(question));
									} else {
										if (
											data.data.question.title !==
											question.title
										) {
											// check if question match
											resolve(post(question));
										}
									}
									resolve();
								}
							);
						});
						promises.push(temp);
					}
					if (method === 2) {
						promises.push(post(question));
					}
				});
			}

			// wait everything and post the quiz
			quizPromises.push(
				Promise.all(promises).then(
					() => {
						// quiz.questions.forEach(question => {
						//     question.id = question.id;
						// })
						quiz.course = props.course;
						// console.log(quiz)
						return postQuiz(quiz);
					},
					function (err) {
						console.error('push quizPromises', err);
						// error occurred
					}
				)
			);
		});

		// wait until all quiz has been uploaded, we close the modal and reload
		Promise.all(quizPromises).then(
			() => {
				setLoading(false);
				setMethod(1);
				setQuizzes({});
				setCopy(false);
				setVisible(false);
				// props.fetch();  // this only fetches the quiz, but we also updated the questions
				window.location.reload(); // maybe we can fix it later to not reload the entire page
			},
			function (err) {
				setLoading(false);
				//props.fetch();
				console.error('quizPromises', err);
				window.location.reload();
			}
		);
	};

	const onCancel = () => {
		setMethod(1);
		setQuizzes({});
		setCopy(false);
		setVisible(false);
	};

	const postQuiz = (values) =>
		PostQuiz(JSON.stringify(values), props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Submit failed, see browser console for more details.'
				);
				console.error(data);
			} else {
			}
		});

	const postQuestion = (question) => {
		return PostQuestion(question, props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Submit failed, see browser console for more details.'
				);
				console.error(data);
			} else {
				return data;
			}
		});
	};

	return (
		<span>
			<Button icon={<UploadOutlined />} onClick={() => setVisible(true)}>
				Import
			</Button>

			<Modal
				title="Import quiz"
				open={visible}
				onOk={onOk}
				onCancel={onCancel}
				destroyOnClose={true}
				confirmLoading={loading}
			>
				<Form.Item label="Import and Copy questions" extra={explain}>
					<Radio.Group value={method} onChange={(e) => setMethod(e.target.value)}>
						<Radio.Button value={0}>
							<span style={{ color: 'red' }}>No</span>
						</Radio.Button>
						<Radio.Button value={1}>
							<span style={{ color: 'orange' }}>Auto</span>
						</Radio.Button>
						<Radio.Button value={2}>
							<span style={{ color: 'green' }}>Yes</span>
						</Radio.Button>
					</Radio.Group>
				</Form.Item>

				<Form.Item
					label="Get a copy of questions in my questionbank when copy questions"
					extra={copy ? explain2 : 'You will not get a copy in your questionbank.'}
				>
					<Radio.Group
						value={copy}
						onChange={(e) => setCopy(e.target.value)}
						disabled={method === 0}
					>
						<Radio.Button value={false}>
							<span style={{ color: 'red' }}>No</span>
						</Radio.Button>
						<Radio.Button value={true}>
							<span style={{ color: 'green' }}>Yes</span>
						</Radio.Button>
					</Radio.Group>
				</Form.Item>

				<Upload
					beforeUpload={loadFile}
					accept=".json"
					multiple={true}
					onRemove={removeFile}
				>
					<Button icon={<UploadOutlined />}>Select Files</Button>
				</Upload>
			</Modal>
		</span>
	);
}

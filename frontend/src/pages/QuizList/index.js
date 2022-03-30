import React from 'react';
import {
	BarChartOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeFilled,
	EyeInvisibleFilled,
} from '@ant-design/icons';
import { Button, Divider, List, message, Typography } from 'antd';
import './index.css';
import OngoingQuiz from '../../components/QuizCard/OngoingQuiz';
import GetQuizzes from '../../networks/GetQuizzes';
import moment from 'moment';
import InComingQuiz from '../../components/QuizCard/InComingQuiz';
import { Link } from 'react-router-dom';
import QuizInfoModal from '../../components/QuizCard/QuizInfoModal';
import QuizLinkModal from '../../components/QuizCard/QuizLinkModal';
import GetAttemptListByQuiz from '../../networks/GetAttemptListByQuiz';
import GetCourses from '../../networks/GetCourses';
import Admin from '../../contexts/Admin';
import DeleteQuiz from '../../networks/DeleteQuiz';
import HasPermission from '../../contexts/HasPermission';
import HideQuiz from '../../networks/HideQuiz';

/**
 * Quiz list showing all the quizzes with card view
 */
export default class QuizList extends React.Component {
	state = {
		courses: [],
		targetQuiz: {},
		data: {},
		showQuizModal: false,
		showLinkModal: false,
	};

	componentDidMount() {
		this.fetch();
	}

	fetch = (params = {}) => {
		this.setState({ loading: true });
		GetCourses(this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch courses, see browser console for more details.'
				);
				this.setState({
					loading: false,
				});
			} else {
				// let quiz = this.findQuizById(quizId);
				// if (quiz) {
				//     quiz = quiz[0]
				// }
				const courses = data.data;
				GetQuizzes(this.props.token, params).then((data) => {
					if (!data || data.status !== 200) {
						message.error(
							'Cannot fetch quiz, see browser console for more details.'
						);
						this.setState({
							loading: false,
						});
					} else {
						const pagination = { ...this.state.pagination };
						pagination.total = data.data.length;
						if (data.data && data.data.processing) {
							data.data.processing.sort((a, b) =>
								moment
									.utc(a.end_date)
									.isAfter(moment.utc(b.end_date))
									? 1
									: -1
							);
						}
						this.setState({
							loading: false,
							courses: courses,
							data: data.data ? data.data : {},
							pagination,
						});
					}
				});
			}
		});
	};

	hide = (id, bool) => {
		this.setState({ loading: true });
		HideQuiz(id, bool, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot hide/reveal quiz, see browser console for more details.'
				);
				this.setState({
					loading: false,
				});
			} else {
				this.fetch();
			}
		});
	};

	delete = (id, course) => {
		this.setState({ loading: true });
		DeleteQuiz(id, course, this.props.token).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot delete quiz, see browser console for more details.'
				);
				this.setState({
					loading: false,
				});
			} else {
				this.fetch();
			}
		});
	};

	fetchAttempt = (quizId, params = {}) => {
		this.setState({ loading: true });
		GetAttemptListByQuiz(quizId, this.props.token, params).then((data) => {
			if (!data || data.status !== 200) {
				message.error(
					'Cannot fetch quiz attempts, see browser console for more details.'
				);
				this.setState({
					loading: false,
				});
			} else {
				// let quiz = this.findQuizById(quizId);
				// if (quiz) {
				//     quiz = quiz[0]
				// }

				this.setState({
					loading: false,
					targetQuiz: quizId,
					create:
						data.data.end === null ||
						moment.now() < moment.utc(data.data.end),
					quizAttempts: data.data.quiz_attempts,
					showQuizModal: true,
				});
			}
		});
	};

	render() {
		const grid = {
			gutter: 16,
			xs: 1,
			sm: 1,
			md: 2,
			lg: 2,
			xl: 3,
			xxl: 4,
		};
		console.log(this.state.data.processing);

		return (
			<div className="QuizList">
				<Typography.Title level={2}>
					My Quizzes
					<Admin>
						<Link to="Quiz/new">
							<Button
								size={'large'}
								type={'primary'}
								style={{ float: 'right' }}
							>
								New
							</Button>
						</Link>
					</Admin>
				</Typography.Title>
				<div className="Quizzes">
					<Typography.Title level={3}>Ongoing</Typography.Title>
					<List
						grid={grid}
						dataSource={this.state.data.processing}
						renderItem={(item) =>
							item.late ? (
								<List.Item>
									<OngoingQuiz
										action={this.fetchAttempt}
										background={'#fffb00'}
										id={item.id}
										is_hidden={item.options.is_hidden}
										outside_course={
											item.options.outside_course
										}
										delete={() => {
											this.delete(item.id, item.course);
										}}
										hide={() =>
											item.options.is_hidden
												? this.hide(item.id, false)
												: this.hide(item.id, true)
										}
										link={() => {
											this.setState({
												targetQuiz: item.id,
												showLinkModal: true,
											});
										}}
										course={this.state.courses.find(
											(course) =>
												course.id === item.course
										)}
										title={
											<span style={{ color: 'red' }}>
												{item.title}
											</span>
										}
										status={item.status}
										endTime={moment.utc(item.late_time)}
										startTime={moment.utc(item.start_date)}
									/>
								</List.Item>
							) : (
								<List.Item>
									<OngoingQuiz
										action={this.fetchAttempt}
										id={item.id}
										is_hidden={item.options.is_hidden}
										outside_course={
											item.options.outside_course
										}
										delete={() => {
											this.delete(item.id, item.course);
										}}
										hide={() =>
											item.options.is_hidden
												? this.hide(item.id, false)
												: this.hide(item.id, true)
										}
										link={() => {
											this.setState({
												targetQuiz: item.id,
												showLinkModal: true,
											});
										}}
										course={
											this.state.courses.find(
												(course) =>
													course.id === item.course
											) || {
												id: -1,
												shortname: 'No Course',
												fullname: 'No course',
											}
										}
										title={item.title}
										status={item.status}
										endTime={
											item.end_date &&
											moment.utc(item.end_date)
										}
										startTime={moment.utc(item.start_date)}
									/>
								</List.Item>
							)
						}
					/>
					<Divider dashed style={{ margin: '0px 0px 12px 0px' }} />
					<Typography.Title level={3}>Future</Typography.Title>
					<List
						grid={grid}
						dataSource={this.state.data.not_begin}
						renderItem={(item) => (
							<List.Item>
								<InComingQuiz
									delete={() => {
										this.delete(item.id, item.course);
									}}
									hide={() =>
										item.options.is_hidden
											? this.hide(item.id, false)
											: this.hide(item.id, true)
									}
									link={() =>
										this.setState({
											targetQuiz: item.id,
											showLinkModal: true,
										})
									}
									is_hidden={item.options.is_hidden}
									id={item.id}
									course={this.state.courses.find(
										(course) => course.id === item.course
									)}
									title={item.title}
									status={item.status}
									endTime={
										item.end_date &&
										moment.utc(item.end_date)
									}
									startTime={moment.utc(item.start_date)}
								/>
							</List.Item>
						)}
					/>
					<Divider dashed style={{ margin: '0px 0px 12px 0px' }} />
					<Typography.Title level={3}>Completed</Typography.Title>
					<List
						style={{
							maxHeight: 'calc(100vh - 100px)',
							marginBottom: 24,
							overflowY: 'auto',
						}}
						size={'small'}
						dataSource={this.state.data.done}
						bordered
						className="listItem"
						pagination={{
							hideOnSinglePage: true,
							showSizeChanger: true,
							defaultPageSize: 20,
							pageSizeOptions: ['10', '20', '50', '100'],
						}}
						renderItem={(item) => (
							<List.Item
								actions={[
									<HasPermission
										id={item.course}
										nodes={['view_gradebook']}
									>
										<Link to={`/Quiz/Gradebook/${item.id}`}>
											<Button
												icon={<BarChartOutlined />}
												type={'link'}
												size={'small'}
											>
												Gradebook
											</Button>
										</Link>
									</HasPermission>,
									<HasPermission
										id={item.course}
										nodes={['view_attempt']}
										fallback={
											<span>
												{moment(
													item.end_date
												).fromNow()}
											</span>
										}
									>
										<Button
											size="small"
											icon={<EditOutlined />}
											type="link"
											onClick={() => {
												this.fetchAttempt(item.id);
											}}
										>
											Attempt
										</Button>
									</HasPermission>,
									<HasPermission
										id={item.course}
										nodes={['change_quiz']}
										fallback={undefined}
									>
										<Button
											onClick={() =>
												item.options.is_hidden
													? this.hide(item.id, false)
													: this.hide(item.id, true)
											}
											size="small"
											icon={
												!item.options.is_hidden ? (
													<EyeFilled />
												) : (
													<EyeInvisibleFilled />
												)
											}
											type="link"
										>
											{!item.options.is_hidden
												? 'Hide'
												: 'Reveal'}
										</Button>
									</HasPermission>,
									<HasPermission
										id={item.course}
										nodes={['change_quiz']}
									>
										<Link to={`/Quiz/edit/${item.id}`}>
											<Button
												size="small"
												icon={<EditOutlined />}
												type="link"
											>
												Edit
											</Button>
										</Link>
									</HasPermission>,
									<HasPermission
										id={item.course}
										nodes={['delete_quiz']}
									>
										<Button
											size="small"
											icon={<DeleteOutlined />}
											type="link"
											style={{ color: 'red' }}
											onClick={() =>
												this.delete(
													item.id,
													item.course
												)
											}
										>
											Delete
										</Button>
									</HasPermission>,
								]}
								style={{
									background: item.options.is_hidden
										? '#DDDDDD'
										: undefined,
								}}
							>
								<List.Item.Meta
									// change to stats ?
									title={
										<Button
											type={'link'}
											onClick={() =>
												this.fetchAttempt(item.id)
											}
										>
											{item.title}
										</Button>
									}
								/>
							</List.Item>
						)}
					/>
				</div>
				<QuizInfoModal
					create={this.state.create}
					token={this.props.token}
					id={this.state.targetQuiz}
					attempts={this.state.quizAttempts}
					visible={this.state.showQuizModal}
					onClose={() => {
						this.setState({ showQuizModal: false });
					}}
				/>
				<QuizLinkModal
					id={this.state.targetQuiz}
					visible={this.state.showLinkModal}
					onClose={() => this.setState({ showLinkModal: false })}
				/>
			</div>
		);
	}
}

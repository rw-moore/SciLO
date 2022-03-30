import React from 'react';
import {
	BarChartOutlined,
	EditOutlined,
	EllipsisOutlined,
} from '@ant-design/icons';
import { Button, Card, Tag } from 'antd';
import UserIcon from '../Users/UserIcon';
import QuizTimeline from './QuizTimeline';
import QuizCardOperations from './QuizCardOperations';
import RandomColorBySeed from '../../utils/RandomColorBySeed';
import HasPermission from '../../contexts/HasPermission';
import { Link } from 'react-router-dom';
// import HideQuiz from "../../networks/HideQuiz";

/* quiz card for the current quiz including late time quiz */
export default class OngoingQuiz extends React.Component {
	// XXX temp state PLEASE REMOVE
	state = {
		hidden: false,
		background: undefined,
	};

	// hide quiz

	render() {
		const { Meta } = Card;

		return (
			<Card
				style={{
					background: this.props.is_hidden
						? '#DDDDDD'
						: this.props.background,
				}}
				actions={[
					<HasPermission
						id={this.props.course.id}
						nodes={['view_gradebook']}
					>
						<Link to={`/Quiz/Gradebook/${this.props.id}`}>
							<Button
								icon={<BarChartOutlined />}
								type={'link'}
								size={'small'}
							>
								Gradebook
							</Button>
						</Link>
					</HasPermission>,
					this.props.outside_course ? (
						<Button
							icon={<EditOutlined />}
							type={'link'}
							size={'small'}
							onClick={() => {
								this.props.action(this.props.id);
							}}
						>
							Attempt
						</Button>
					) : (
						<HasPermission
							id={this.props.course.id}
							nodes={['view_attempt']}
						>
							<Button
								icon={<EditOutlined />}
								type={'link'}
								size={'small'}
								onClick={() => {
									this.props.action(this.props.id);
								}}
							>
								Attempt
							</Button>
						</HasPermission>
					),
					<HasPermission
						id={this.props.course.id}
						nodes={['delete_quiz', 'change_quiz']}
						any={true}
					>
						<QuizCardOperations
							id={this.props.id}
							course={this.props.course.id}
							hidden={this.props.is_hidden}
							hide={this.props.hide}
							delete={this.props.delete}
							link={this.props.link}
						>
							<EllipsisOutlined />
						</QuizCardOperations>
					</HasPermission>,
				]}
			>
				<Meta
					avatar={<UserIcon />}
					title={
						<span>
							{this.props.title}
							{this.props.course && this.props.course.id !== -1 && (
								<Link to={`/Course/${this.props.course.id}`}>
									<Tag
										style={{ float: 'right' }}
										color={
											RandomColorBySeed(
												this.props.course.id
											).bg
										}
									>
										<span
											style={{
												color: RandomColorBySeed(
													this.props.course.id
												).fg,
											}}
										>
											{this.props.course.shortname}
										</span>
									</Tag>
								</Link>
							)}
						</span>
					}
				/>
				<QuizTimeline
					endTime={this.props.endTime}
					startTime={this.props.startTime}
					status={this.props.status}
				/>
			</Card>
		);
	}
}

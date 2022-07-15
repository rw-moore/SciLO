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

const { Meta } = Card;

/* quiz card for the current quiz including late time quiz */
export default function OngoingQuiz(props) {
	return (
		<Card
			style={{
				background: props.is_hidden ? '#DDDDDD' : props.background,
			}}
			actions={[
				<HasPermission id={props.course.id} nodes={['view_gradebook']}>
					<Link to={`/Quiz/Gradebook/${props.id}`}>
						<Button icon={<BarChartOutlined />} type={'link'} size={'small'}>
							Gradebook
						</Button>
					</Link>
				</HasPermission>,
				props.outside_course ? (
					<Button
						icon={<EditOutlined />}
						type={'link'}
						size={'small'}
						onClick={() => {
							props.action(props.id);
						}}
					>
						Attempt
					</Button>
				) : (
					<HasPermission id={props.course.id} nodes={['view_attempt']}>
						<Button
							icon={<EditOutlined />}
							type={'link'}
							size={'small'}
							onClick={() => {
								props.action(props.id);
							}}
						>
							Attempt
						</Button>
					</HasPermission>
				),
				<HasPermission
					id={props.course.id}
					nodes={['delete_quiz', 'change_quiz']}
					any={true}
				>
					<QuizCardOperations
						id={props.id}
						course={props.course.id}
						hidden={props.is_hidden}
						hide={props.hide}
						delete={props.delete}
						link={props.link}
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
						{props.title}
						{props.course && props.course.id !== -1 && (
							<Link to={`/Course/${props.course.id}`}>
								<Tag
									style={{ float: 'right' }}
									color={RandomColorBySeed(props.course.id).bg}
								>
									<span
										style={{
											color: RandomColorBySeed(props.course.id).fg,
										}}
									>
										{props.course.shortname}
									</span>
								</Tag>
							</Link>
						)}
					</span>
				}
			/>
			<QuizTimeline
				endTime={props.endTime}
				startTime={props.startTime}
				status={props.status}
			/>
		</Card>
	);
}

import React from 'react';
import '../../pages/Course/index.css';
import QuestionBankTable from '../../pages/QuestionBankTable/QuestionBankTable';

/**
 * Question table for the question bank section
 */
export default function CourseQuestionBank(props) {
	return (
		<QuestionBankTable
			columns={[
				'descriptor',
				'text',
				'author',
				'responses',
				'tags',
				'actions',
			]}
			defaultFetch={{
				courses: [props.course.id],
			}}
			usePerms={true}
			token={props.token}
			course={props.course}
			url={'/QuestionBank'}
		/>
	);
}

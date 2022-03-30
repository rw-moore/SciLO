import React from 'react';
import './index.css';
import QuestionBankTable from './QuestionBankTable';

/**
 * Question table for the question bank section
 */
export default function QuestionBank(props) {
	return (
		<QuestionBankTable
			columns={[
				'descriptor',
				'text',
				'responses',
				'author',
				'tags',
				'actions',
			]}
			defaultFetch={{
				owners: [props.user],
			}}
			token={props.token}
			url={props.url}
		/>
	);
}

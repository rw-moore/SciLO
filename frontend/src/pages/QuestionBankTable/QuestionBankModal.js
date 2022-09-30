import { Modal } from 'antd';
import React, { useState } from 'react';
import './index.css';
import QuestionBankTable from './QuestionBankTable';

/**
 * Question table for the question bank section in a modal
 */
export default function QuestionBankModal(props) {
	const [selectedKeys, setSelectedKeys] = useState(props.keys || []);

	const onOk = () => {
		props.update(selectedKeys);
		props.close();
	};

	const onCancel = () => {
		props.close();
	};

	return (
		<Modal
			className="QuestionTable"
			title="QuestionBank"
			open={props.visible}
			onOk={onOk}
			onCancel={onCancel}
			width="80%"
			style={{ top: 64 }}
			destroyOnClose
		>
			<QuestionBankTable
				columns={[
					'descriptor',
					'courses',
					'text',
					'author',
					'responses',
					'tags',
					'actions',
				]}
				defaultFetch={{}}
				token={props.token}
				url={'/QuestionBank'}
				update={(selected) => setSelectedKeys(selected)}
				hideActions={['edit', 'delete']}
				hideButtons={true}
			/>
		</Modal>
	);
}

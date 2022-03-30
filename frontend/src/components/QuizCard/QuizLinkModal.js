import React from 'react';
import { Modal, Typography } from 'antd';
// import API from "../../networks/Endpoints";

const QuizLinkModal = (props) => {
	if (props.id) {
		const text = window.location.href + '/' + props.id + '/new';
		return (
			<Modal
				destroyOnClose
				title={'Get Link'}
				visible={props.visible}
				onOk={props.onClose}
				onCancel={props.onClose}
				footer={null}
			>
				<div style={{ textAlign: 'center' }}>
					<Typography.Paragraph>
						You can put this link in the src of an iframe to embed
						the quiz.
					</Typography.Paragraph>
					<Typography.Text copyable>{text}</Typography.Text>
				</div>
			</Modal>
		);
	} else {
		return <></>;
	}
};

export default QuizLinkModal;

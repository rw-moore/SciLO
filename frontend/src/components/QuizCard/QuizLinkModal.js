import React from 'react';
import { Modal, Typography } from 'antd';
// import API from "../../networks/Endpoints";

const QuizLinkModal = (props) => {
	if (props.id) {
		const iframe_text = `${window.location.href}/${props.id}/new`;
		const lti_text = `${window.location.origin}/lti/${props.id}/`;
		return (
			<Modal
				destroyOnClose
				title={'Get Link'}
				open={props.visible}
				onOk={props.onClose}
				onCancel={props.onClose}
				footer={null}
			>
				<div style={{ textAlign: 'center' }}>
					<Typography.Paragraph>
						You can put this link in the src of an iframe to embed the quiz.
					</Typography.Paragraph>
					<Typography.Text copyable>{iframe_text}</Typography.Text>
					<Typography.Paragraph>
						You can put this link on eclass to link the quiz.
					</Typography.Paragraph>
					<Typography.Text copyable>{lti_text}</Typography.Text>
				</div>
			</Modal>
		);
	} else {
		return <></>;
	}
};

export default QuizLinkModal;

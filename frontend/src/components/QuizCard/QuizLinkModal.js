import React from 'react';
import { Button, Modal, Typography } from 'antd';
import GetQuizSecrets from '../../networks/GetQuizSecrets';
// import API from "../../networks/Endpoints";

const QuizLinkModal = (props) => {
	const [secrets, setSecrets] = React.useState({});

	const getSecrets = () => {
		GetQuizSecrets(props.id, props.token).then((data) => {
			console.log(data.data);
			setSecrets({
				consumer: data.data.consumer_key,
				shared: data.data.shared_secret,
			});
		});
	};

	if (props.id) {
		const iframe_text = `${window.location.href}/${props.id}/new`;
		const lti_text = `${window.location.origin}/lti/${props.id}/`;
		return (
			<Modal
				destroyOnClose={true}
				title={'Get Link'}
				open={props.visible}
				onOk={props.onClose}
				onCancel={props.onClose}
				afterClose={() => setSecrets({})}
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
					<br />
					{Object.keys(secrets).length === 0 ? (
						<Button type="link" onClick={getSecrets}>
							Get secrets
						</Button>
					) : (
						<span>
							Consumer key:{' '}
							<Typography.Text copyable>{secrets.consumer}</Typography.Text>
							<br />
							Shared Secret:{' '}
							<Typography.Text copyable>{secrets.shared}</Typography.Text>
						</span>
					)}
				</div>
			</Modal>
		);
	} else {
		return <></>;
	}
};

export default QuizLinkModal;

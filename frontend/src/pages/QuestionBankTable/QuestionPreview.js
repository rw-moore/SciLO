import { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import OfflineFrame from '../../components/QuestionPreviews/OfflineFrame';
import API from '../../networks/Endpoints';
import GetQuestionById from '../../networks/GetQuestionById';

function QuestionPreview(props) {
	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState(null);
	const [images, setImages] = useState([]);
	const [seed, setSeed] = useState(0);

	const fetch = () => {
		setLoading(true);
		GetQuestionById(props.id, props.token, { substitute: true }).then(
			(data) => {
				if (!data || data.status !== 200) {
					message.error(
						`Cannot fetch question ${props.id}, see browser console for more details.`
					);
					console.error('FETCH_FAILED', data);
					setLoading(false);
				} else {
					if (data.data.error) {
						message.error(data.data.error);
					}
					let var_question =
						data.data.var_question || data.data.question;
					var_question.question_image =
						var_question.question_image.map((file) => ({
							...file,
							url: API.domain + '/api' + file.url,
						}));
					setQuestion(var_question);
					setImages(var_question.question_image);
					setSeed(data.data.temp_seed || 0);
					setLoading(false);
				}
			}
		);
	};
	useEffect(() => {
		fetch();
	}, []);

	return (
		<div
			style={{
				padding: 22,
				background: '#fff',
				height: '89vh',
				overflowY: 'auto',
				borderStyle: 'solid',
				borderRadius: '4px',
				borderColor: '#EEE',
				borderWidth: '2px',
			}}
		>
			<h1>Preview</h1>
			{loading ? (
				<Spin size="large" />
			) : (
				<OfflineFrame
					key={question.title}
					question={question}
					token={props.token}
					loadVars={fetch}
					images={images}
					temp_seed={seed}
				/>
			)}
		</div>
	);
}

export default QuestionPreview;

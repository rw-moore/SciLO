import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function PostQuestion(question, token) {
	return axios
		.post(
			API.domain + '/api/' + API.endpoints.questions.address,
			JSON.stringify(question),
			{
				headers: {
					'Content-Type': 'application/json',
					authorization: `Token ${token}`,
				},
			}
		)
		.then((response) => {
			console.log(response);
			return response;
		})
		.catch(ErrorHandler);
}

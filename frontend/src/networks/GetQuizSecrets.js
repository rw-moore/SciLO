import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function GetQuizSecrets(id, token, params = {}) {
	return axios
		.get(API.domain + '/api/quiz/' + id + '/secrets', {
			headers: {
				'Content-Type': 'application/json',
				authorization: `Token ${token}`,
			},
			params: params,
		})
		.then((response) => {
			console.log(response);
			return response;
		})
		.catch(ErrorHandler);
}

import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function GetQuizzes(token, params = {}) {
	return axios
		.get(API.domain + '/api/quizzes?group=status', {
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

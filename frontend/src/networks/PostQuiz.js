import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function PostQuiz(quiz, token) {
	return axios
		.post(API.domain + '/api/' + API.endpoints.quiz.address, quiz, {
			headers: {
				'Content-Type': 'application/json',
				authorization: `Token ${token}`,
			},
		})
		.then((response) => {
			console.log(response);
			return response;
		})
		.catch(ErrorHandler);
}

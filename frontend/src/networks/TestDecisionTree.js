import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function TestDecisionTree(data, token) {
	return axios
		.post(API.domain + '/api/tree', data, {
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

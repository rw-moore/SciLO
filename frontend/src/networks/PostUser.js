import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function PostUser(user) {
	const form_data = new FormData();

	for (let key in user) {
		if (user[key]) form_data.append(key, user[key]);
	}

	return axios
		.post(API.domain + '/api/' + API.endpoints.user.address, form_data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		.then((response) => {
			console.log(response);
			return response;
		})
		.catch(ErrorHandler);
}

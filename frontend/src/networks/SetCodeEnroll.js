import axios from 'axios';
import API from './Endpoints';
import ErrorHandler from './ErrorHandler';

export default function SetCodeEnroll(courseid, role, token) {
	return axios
		.post(
			API.domain +
				'/api/' +
				API.endpoints.course.address +
				`/${courseid}/setDefaultEnroll`,
			{ role: role },
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

const local = true;
const domain = local
	? 'http://localhost:8000'
	: 'https://equiz.math.ualberta.ca';

const endpoints = {
	domain: domain,
	endpoints: {
		questions: {
			address: 'questions',
			methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
		},
		tags: {
			address: 'tags',
			methods: ['GET', 'POST'],
		},
		quiz: {
			address: 'quiz',
			methods: ['GET', 'POST'],
		},
		user: {
			address: 'userprofile',
			methods: ['GET', 'POST', 'PUT', 'PATCH'],
		},
		email: {
			address: 'email',
			methods: ['GET', 'POST'],
		},
		attempt: {
			address: 'quiz-attempt',
			methods: ['GET', 'POST'],
		},
		course: {
			address: 'course',
			methods: ['GET', 'POST'],
		},
	},
};
export default endpoints;

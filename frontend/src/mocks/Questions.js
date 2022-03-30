export default [
	{
		title: 'Mock Question 1',
		text: 'Some basic mathematical calculations... Good Luck!',
		tags: [
			{
				name: 'Easy',
			},
			{
				name: 'Math',
			},
		],
		responses: [
			{
				type: {
					name: 'input',
					label: 'Answer',
				},
				text: 'What is the result of 1 + 1?',
				answers: [
					{
						text: '2',
						grade: 100,
					},
					{
						text: 'two',
						grade: 100,
					},
					{
						text: '0',
						grade: 10,
					},
				],
			},
			{
				type: {
					name: 'input',
					label: 'Result',
				},
				text: 'What is the result of 1.5 * 2?',
				answers: [
					{
						text: '3',
						grade: 100,
					},
				],
			},
			{
				type: {
					name: 'input',
				},
				text: 'What is the result of 1.5 * 2? (No label)',
				answers: [
					{
						text: '3',
						grade: 100,
					},
				],
			},
		],
	},
	{
		title: 'Mock Question 2',
		text: 'Some interesting multiple choice questions.',
		tags: [
			{
				name: 'Fun',
			},
		],
		responses: [
			{
				type: {
					name: 'multiple',
					single: true,
					dropdown: false,
				},
				text: "Select 'Red'",
				answers: [
					{
						text: 'Blue',
						grade: 0,
					},
					{
						text: 'Red',
						grade: 100,
					},
					{
						text: 'red',
						grade: 50,
					},
				],
			},
			{
				type: {
					name: 'multiple',
					single: false,
					dropdown: false,
				},
				text: 'Select red color',
				answers: [
					{
						text: 'Blue',
						grade: -50,
					},
					{
						text: 'Red',
						grade: 50,
					},
					{
						text: 'red',
						grade: 50,
					},
				],
			},
			{
				type: {
					name: 'multiple',
					single: false,
					dropdown: true,
				},
				text: 'Select red color',
				answers: [
					{
						text: 'Blue',
						grade: -50,
					},
					{
						text: 'Red',
						grade: 50,
					},
					{
						text: 'red',
						grade: 50,
					},
				],
			},
		],
	},
];

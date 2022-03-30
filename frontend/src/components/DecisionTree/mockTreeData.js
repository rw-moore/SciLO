export const mockData = {
	title: 'root',
	type: -1,
	policy: 'max',
	allow_negatives: false,
	children: [
		{
			title: '-50 for everyone',
			bool: true,
			type: 0,
			score: -50,
			feedback: 'you lost 50 marks.',
		},
		{
			title: '50 for everyone',
			bool: true,
			type: 0,
			score: 50,
			feedback: 'you earned 50 marks.',
		},
		{
			title: '_value > 5',
			label: 'is my number > 5',
			bool: true,
			type: 1,
			feedback: {
				true: 'your number is > 5',
				false: 'your number is not > 5',
			},
			children: [
				{
					title: '50 score if my number > 5',
					feedback: 'you get 50 if your number > 5',
					bool: true,
					type: 0,
					score: 50,
				},
				{
					title: '_value > 10',
					label: 'is my number > 10',
					bool: true,
					type: 1,
					feedback: {
						true: 'your number is > 10',
						false: 'your number is not > 10',
					},
					children: [
						{
							title: '50 score if my number > 10',
							bool: true,
							type: 0,
							score: 50,
						},
					],
				},
			],
		},
	],
};

function arrows() {
	return [
		{
			class: 'action',
			command: ['performWithFeedback', 'moveToPreviousChar'],
			label: '<svg class="svg-glyph"><use xlink:href=\'#svg-arrow-left\' /></svg>',
		},
		{
			class: 'action',
			command: ['performWithFeedback', 'moveToNextChar'],
			label: '<svg class="svg-glyph"><use xlink:href=\'#svg-arrow-right\' /></svg>',
		},
		{
			class: 'action',
			command: ['performWithFeedback', 'moveToNextPlaceholder'],
			label: '<svg class="svg-glyph"><use xlink:href=\'#svg-tab\' /></svg>',
		},
	];
}

const layers = {
	'alphabet-layer': {
		styles: '',
		rows: [
			[
				{
					class: 'if-wide',
					label: '7',
				},
				{
					class: 'if-wide',
					label: '8',
				},
				{
					class: 'if-wide',
					label: '9',
				},
				{
					class: 'if-wide',
					label: '&divide;',
					insert: '\\frac{#@}{#?}',
				},
				{
					label: 'q',
					shifted: 'Q',
				},
				{
					label: 'w',
					shifted: 'W',
				},
				{
					label: 'e',
					shifted: 'E',
				},
				{
					label: 'r',
					shifted: 'R',
				},
				{
					label: 't',
					shifted: 'T',
				},
				{
					label: 'y',
					shifted: 'Y',
				},
				{
					label: 'u',
					shifted: 'U',
				},
				{
					label: 'i',
					shifted: 'I',
				},
				{
					label: 'o',
					shifted: 'O',
				},
				{
					label: 'p',
					shifted: 'P',
				},
			],
			[
				{
					class: 'if-wide',
					label: '4',
				},
				{
					class: 'if-wide',
					label: '5',
				},
				{
					class: 'if-wide',
					label: '6',
				},
				{
					class: 'if-wide',
					label: '&times;',
					insert: '\\times ',
				},
				{
					class: 'separator w5',
				},
				{
					label: 'a',
					shifted: 'A',
				},
				{
					label: 's',
					shifted: 'S',
				},
				{
					label: 'd',
					shifted: 'D',
				},
				{
					label: 'f',
					shifted: 'F',
				},
				{
					label: 'g',
					shifted: 'G',
				},
				{
					label: 'h',
					shifted: 'H',
				},
				{
					label: 'j',
					shifted: 'J',
				},
				{
					label: 'k',
					shifted: 'K',
				},
				{
					label: 'l',
					shifted: 'L',
				},
				{
					class: 'separator w5',
				},
			],
			[
				{
					class: 'if-wide',
					label: '1',
				},
				{
					class: 'if-wide',
					label: '2',
				},
				{
					class: 'if-wide',
					label: '3',
				},
				{
					class: 'if-wide',
					label: '-',
				},
				{
					class: 'shift modifier font-glyph bottom left w15 layer-switch',
					label: '&#x21e7;',
				},
				{
					label: 'z',
					shifted: 'Z',
				},
				{
					label: 'x',
					shifted: 'X',
				},
				{
					label: 'c',
					shifted: 'C',
				},
				{
					label: 'v',
					shifted: 'V',
				},
				{
					label: 'b',
					shifted: 'B',
				},
				{
					label: 'n',
					shifted: 'N',
				},
				{
					label: 'm',
					shifted: 'M',
				},
				{
					class: 'action font-glyph bottom right w15',
					label: '&#x232b;',
					command: ['performWithFeedback', 'deleteBackward'],
				},
			],
			[
				{
					class: 'if-wide',
					label: '0',
				},
				{
					class: 'if-wide',
					label: '.',
					command: 'insertDecimalSeparator',
				},
				{
					class: 'if-wide',
					label: '=',
				},
				{
					class: 'if-wide',
					label: '+',
				},
				{
					label: ';',
				},
				{
					label: ',',
				},
				{
					class: 'separator w50',
					label: '&nbsp;',
					command: ['insert', ' '],
				},
				...arrows(),
			],
		],
	},
	'greek-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\varphi',
				},
				{
					latex: '\\varsigma',
				},
				{
					latex: '\\epsilon',
				},
				{
					latex: '\\rho',
				},
				{
					latex: '\\tau',
				},
				{
					latex: '\\upsilon',
				},
				{
					latex: '\\theta',
				},
				{
					latex: '\\iota',
				},
				{
					latex: '\\omicrom',
				},
				{
					latex: '\\pi',
				},
			],
			[
				{
					latex: '\\alpha',
				},
				{
					latex: '\\sigma',
				},
				{
					latex: '\\delta',
				},
				{
					latex: '\\phi',
				},
				{
					latex: '\\gamma',
				},
				{
					latex: '\\eta',
				},
				{
					latex: '\\xi',
				},
				{
					latex: '\\kappa',
				},
				{
					latex: '\\lambda',
				},
			],
			[
				{
					class: 'shift modifier font-glyph bottom left w15 layer-switch',
					label: '&#x21e7;',
				},
				{
					latex: '\\zeta',
				},
				{
					latex: '\\chi',
				},
				{
					latex: '\\psi',
				},
				{
					latex: '\\omega',
				},
				{
					latex: '\\beta',
				},
				{
					latex: '\\nu',
				},
				{
					latex: '\\mu',
				},
				{
					latex: '\\iota',
				},
				{
					latex: '\\omicrom',
				},
				{
					latex: '\\pi',
				},
				{
					class: 'action font-glyph bottom right w15',
					label: '&#x232b;',
					command: ['performWithFeedback', 'deleteBackward'],
				},
			],
			[
				{
					label: ' ',
					command: ['insert', ' '],
				},
				{
					label: ',',
				},
				{
					latex: '\\varepsilon',
				},
				{
					latex: '\\vartheta',
				},
				{
					latex: '\\varkappa',
				},
				{
					latex: '\\varpi',
				},
				{
					latex: '\\varrho',
				},
				...arrows(),
			],
		],
	},
	'sets-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\Vector{\\placeholder{}}',
				},
				{
					latex: '\\times',
					insert: '\\CrossProduct{\\placeholder{}}{\\placeholder{}}',
				},
			],
		],
	},
};

const keyboards = {
	'alphabet-keyboard': {
		label: 'ABC',
		tooltip: 'Roman Letters',
		layer: 'alphabet-layer',
	},
	'greek-keyboard': {
		label: '&alpha;&beta;&gamma;',
		classes: 'tex-math',
		tooltip: 'Greek Letters',
		layer: 'greek-layer',
	},
	'sets-keyboard': {
		label: 'Test',
		tooltip: 'Set keys',
		layer: 'sets-layer',
	},
};

export { layers, keyboards };

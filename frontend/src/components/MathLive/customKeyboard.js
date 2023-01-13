import { macros } from './macros';

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
function intLimits(limitType) {
	return `\\int_{\\placeholder{}}^{\\placeholder{}}\\${limitType || ''}limits`;
}
const infinity = {
	latex: macros['Infinity'].def,
	insert: '\\Infinity',
	aside: 'infinity',
};
const summation = {
	latex: '\\sum_{\\placeholder{}}^{\\placeholder{}}\\displaylimits',
	insert: '\\Summation{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
};
const abs = {
	latex: '\\left|\\placeholder{}\\right|',
	insert: '\\Absolute{\\placeholder{}}',
};
const sroot = {
	latex: '\\sqrt{\\placeholder{}}',
	insert: '\\SRoot{\\placeholder{}}',
};
const nroot = {
	latex: '\\sqrt[\\placeholder{}]{\\placeholder{}}',
	insert: '\\NRoot{\\placeholder{}}{\\placeholder{}}',
};
const exp = {
	latex: 'e^\\placeholder{}',
	insert: 'e^\\placeholder{}',
};
const a_exp = {
	latex: '\\placeholder{}^{\\placeholder{}}',
	insert: '\\placeholder{}^\\placeholder{}',
};
const nlog = {
	latex: '\\ln',
	insert: '\\ln(\\placeholder{})',
};
const varlog = {
	latex: '\\log_x y',
	insert: '\\log_{\\placeholder{}}(\\placeholder{})',
};

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
					class: 'action w50',
					label: '&nbsp;',
					command: ['insert', ' '],
				},
				...arrows(),
			],
		],
	},
	'greek-lower-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\alpha',
				},
				{
					latex: '\\beta',
				},
				{
					latex: '\\gamma',
				},
				{
					latex: '\\delta',
				},
				{
					latex: '\\epsilon',

					variants: ['\\varepsilon'],
				},
				{
					latex: '\\zeta',
				},
				{
					latex: '\\eta',
				},
				{
					latex: '\\theta',

					variants: ['\\vartheta'],
				},
				{
					latex: '\\iota',
				},
			],
			[
				{
					latex: '\\kappa',
				},
				{
					latex: '\\lambda',
				},
				{
					latex: '\\mu',
				},
				{
					latex: '\\nu',
				},
				{
					latex: '\\xi',
				},
				{
					latex: 'o',
				},
				{
					latex: '\\pi',
				},
				{
					latex: '\\rho',

					variants: ['\\varrho'],
				},
			],
			[
				{
					class: 'shift modifier font-glyph bottom left selected w15 layer-switch',
					layer: 'greek-upper-layer',
					label: '&#x21e7;',
				},
				{
					latex: '\\sigma',
				},
				{
					latex: '\\tau',
				},
				{
					latex: '\\upsilon',
				},
				{
					latex: '\\phi',

					variants: ['\\varphi'],
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
					class: 'action font-glyph bottom right w15',
					label: '&#x232b;',
					command: ['performWithFeedback', 'deleteBackward'],
				},
			],
		],
	},
	'greek-upper-layer': {
		styles: '',
		rows: [
			[
				{
					latex: 'A',
				},
				{
					latex: 'B',
				},
				{
					latex: '\\Gamma',
				},
				{
					latex: '\\Delta',
				},
				{
					latex: 'E',
				},
				{
					latex: 'Z',
				},
				{
					latex: 'H',
				},
				{
					latex: '\\Theta',
				},
				{
					latex: 'I',
				},
			],
			[
				{
					latex: 'K',
				},
				{
					latex: '\\Lambda',
				},
				{
					latex: 'M',
				},
				{
					latex: 'N',
				},
				{
					latex: '\\Xi',
				},
				{
					latex: 'O',
				},
				{
					latex: '\\Pi',
				},
				{
					latex: 'P',
				},
			],
			[
				{
					class: 'shift modifier font-glyph bottom left selected w15 layer-switch',
					layer: 'greek-lower-layer',
					label: '&#x21e7;',
				},
				{
					latex: '\\Sigma',
				},
				{
					latex: 'T',
				},
				{
					latex: '\\Upsilon',
				},
				{
					latex: '\\Phi',
				},
				{
					latex: 'X',
				},
				{
					latex: '\\Psi',
				},
				{
					latex: '\\Omega',
				},
				{
					class: 'action font-glyph bottom right w15',
					label: '&#x232b;',
					command: ['performWithFeedback', 'deleteBackward'],
				},
			],
		],
	},
	'operators-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\pm',
				},
				{
					latex: '\\mp',
				},
				{
					latex: '\\times',
				},
				{
					latex: '\\div',
				},
				{
					latex: '\\ast',
				},
				{
					latex: '\\star',
				},
				{
					latex: '\\circ',
				},
				{
					latex: '\\bullet',
				},
				{
					latex: '\\divideontimes',
				},
				{
					latex: '\\ltimes',
				},
				{
					latex: '\\rtimes',
				},
				{
					latex: '\\cdot',
				},
				{
					latex: '\\dotplus',
				},
				{
					latex: '\\leftthreetimes',
				},
				{
					latex: '\\rightthreetimes',
				},
				{
					latex: '\\otimes',
				},
				{
					latex: '\\oplus',
				},
				{
					latex: '\\ominus',
				},
				{
					latex: '\\oslash',
				},
				{
					latex: '\\odot',
				},
				{
					latex: '\\circledcirc',
				},
				{
					latex: '\\circleddash',
				},
				{
					latex: '\\circledast',
				},
				{
					latex: '\\bigcirc',
				},
				{
					latex: '\\boxdot',
				},
			],
			[
				{
					latex: '\\boxminus',
				},
				{
					latex: '\\boxplus',
				},
				{
					latex: '\\boxtimes',
				},
				{
					latex: '\\diamond',
				},
				{
					latex: '\\bigtriangleup',
				},
				{
					latex: '\\bigtriangledown',
				},
				{
					latex: '\\triangleleft',
				},
				{
					latex: '\\triangleright',
				},
				{
					latex: '\\lhd',
				},
				{
					latex: '\\rhd',
				},
				{
					latex: '\\unlhd',
				},
				{
					latex: '\\unrhd',
				},
				{
					latex: '\\cup',
				},
				{
					latex: '\\cap',
				},
				{
					latex: '\\uplus',
				},
				{
					latex: '\\Cup',
				},
				{
					latex: '\\Cap',
				},
				{
					latex: '\\wr',
				},
				{
					latex: '\\setminus',
				},
				{
					latex: '\\smallsetminus',
				},
				{
					latex: '\\sqcap',
				},
				{
					latex: '\\sqcup',
				},
				{
					latex: '\\wedge',
				},
				{
					latex: '\\vee',
				},
			],
			[
				{
					latex: '\\barwedge',
				},
				{
					latex: '\\veebar',
				},
				{
					latex: '\\doublebarwedge',
				},
				{
					latex: '\\curlywedge',
				},
				{
					latex: '\\curlyvee',
				},
				{
					latex: '\\dagger',
				},
				{
					latex: '\\ddagger',
				},
				{
					latex: '\\intercal',
				},
				{
					latex: '\\bigcap',
				},
				{
					latex: '\\bigcup',
				},
				{
					latex: '\\biguplus',
				},
				{
					latex: '\\bigsqcup',
				},
				{
					latex: '\\prod',
				},
				{
					latex: '\\coprod',
				},
				{
					latex: '\\bigwedge',
				},
				{
					latex: '\\bigvee',
				},
				{
					latex: '\\bigodot',
				},
				{
					latex: '\\bigoplus',
				},
				{
					latex: '\\bigotimes',
				},
				{
					latex: '\\sum',
				},
				{
					latex: '\\int',
				},
				{
					latex: '\\oint',
				},
				{
					latex: '\\iint',
				},
				{
					latex: '\\iiint',
				},
			],
		],
	},
	'relations-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\bowtie',
				},
				{
					latex: '\\Join',
				},
				{
					latex: '\\propto',
				},
				{
					latex: '\\varpropto',
				},
				{
					latex: '\\multimap',
				},
				{
					latex: '\\pitchfork',
				},
				{
					latex: '\\therefore',
				},
				{
					latex: '\\because',
				},
				{
					latex: '=',
				},
				{
					latex: '\\neq',
				},
				{
					latex: '\\equiv',
				},
				{
					latex: '\\approx',
				},
				{
					latex: '\\sim',
				},
				{
					latex: '\\nsim',
				},
				{
					latex: '\\simeq',
				},
				{
					latex: '\\backsimeq',
				},
				{
					latex: '\\approxeq',
				},
				{
					latex: '\\cong',
				},
				{
					latex: '\\ncong',
				},
				{
					latex: '\\smile',
				},
				{
					latex: '\\frown',
				},
				{
					latex: '\\asymp',
				},
				{
					latex: '\\smallfrown',
				},
				{
					latex: '\\smallsmile',
				},
				{
					latex: '\\between',
				},
				{
					latex: '\\prec',
				},
			],
			[
				{
					latex: '\\curlyeqprec',
				},
				{
					latex: '\\curlyeqsucc',
				},
				{
					latex: '\\precsim',
				},
				{
					latex: '\\succsim',
				},
				{
					latex: '\\precnsim',
				},
				{
					latex: '\\succnsim',
				},
				{
					latex: '\\precapprox',
				},
				{
					latex: '\\succapprox',
				},
				{
					latex: '\\precnapprox',
				},
				{
					latex: '\\succnapprox',
				},
				{
					latex: '\\perp',
				},
				{
					latex: '\\vdash',
				},
				{
					latex: '\\dashv',
				},
				{
					latex: '\\nvdash',
				},
				{
					latex: '\\Vdash',
				},
				{
					latex: '\\Vvdash',
				},
				{
					latex: '\\models',
				},
				{
					latex: '\\vDash',
				},
				{
					latex: '\\nvDash',
				},
				{
					latex: '\\nVDash',
				},
				{
					latex: '\\mid',
				},
				{
					latex: '\\nmid',
				},
				{
					latex: '\\parallel',
				},
				{
					latex: '\\nparallel',
				},
				{
					latex: '\\shortmid',
				},
				{
					latex: '\\nshortmid',
				},
			],
			[
				{
					latex: '\\gg',
				},
				{
					latex: '\\lll',
				},
				{
					latex: '\\ggg',
				},
				{
					latex: '\\leq',
				},
				{
					latex: '\\geq',
				},
				{
					latex: '\\lneq',
				},
				{
					latex: '\\gneq',
				},
				{
					latex: '\\nleq',
				},
				{
					latex: '\\ngeq',
				},
				{
					latex: '\\leqq',
				},
				{
					latex: '\\geqq',
				},
				{
					latex: '\\lneqq',
				},
				{
					latex: '\\gneqq',
				},
				{
					latex: '\\lvertneqq',
				},
				{
					latex: '\\gvertneqq',
				},
				{
					latex: '\\nleqq',
				},
				{
					latex: '\\ngeqq',
				},
				{
					latex: '\\leqslant',
				},
				{
					latex: '\\geqslant',
				},
				{
					latex: '\\nleqslant',
				},
				{
					latex: '\\ngeqslant',
				},
				{
					latex: '\\eqslantless',
				},
				{
					latex: '\\eqslantgtr',
				},
				{
					latex: '\\lessgtr',
				},
				{
					latex: '\\gtrless',
				},
				{
					latex: '\\lesseqgtr',
				},
			],
			[
				{
					latex: '\\ntriangleright',
				},
				{
					latex: '\\trianglelefteq',
				},
				{
					latex: '\\trianglerighteq',
				},
				{
					latex: '\\ntrianglelefteq',
				},
				{
					latex: '\\ntrianglerighteq',
				},
				{
					latex: '\\blacktriangleleft',
				},
				{
					latex: '\\blacktriangleright',
				},
				{
					latex: '\\subset',
				},
				{
					latex: '\\supset',
				},
				{
					latex: '\\subseteq',
				},
				{
					latex: '\\supseteq',
				},
				{
					latex: '\\subsetneq',
				},
				{
					latex: '\\supsetneq',
				},
				{
					latex: '\\varsubsetneq',
				},
				{
					latex: '\\varsupsetneq',
				},
				{
					latex: '\\nsubseteq',
				},
				{
					latex: '\\nsupseteq',
				},
				{
					latex: '\\subseteqq',
				},
				{
					latex: '\\supseteqq',
				},
				{
					latex: '\\subsetneqq',
				},
				{
					latex: '\\supsetneqq',
				},
				{
					latex: '\\nsubseteqq',
				},
				{
					latex: '\\nsupseteqq',
				},
				{
					latex: '\\backepsilon',
				},
				{
					latex: '\\Subset',
				},
				{
					latex: '\\Supset',
				},
			],
			[
				{
					latex: '\\succ',
				},
				{
					latex: '\\nprec',
				},
				{
					latex: '\\nsucc',
				},
				{
					latex: '\\preceq',
				},
				{
					latex: '\\succeq',
				},
				{
					latex: '\\npreceq',
				},
				{
					latex: '\\nsucceq',
				},
				{
					latex: '\\preccurlyeq',
				},
				{
					latex: '\\succcurlyeq',
				},
				{
					latex: '\\shortparallel',
				},
				{
					latex: '\\nshortparallel',
				},
				{
					latex: '<',
				},
				{
					latex: '>',
				},
				{
					latex: '\\nless',
				},
				{
					latex: '\\ngtr',
				},
				{
					latex: '\\lessdot',
				},
				{
					latex: '\\gtrdot',
				},
				{
					latex: '\\ll',
				},
				{
					latex: '\\gtreqless',
				},
				{
					latex: '\\lesseqqgtr',
				},
				{
					latex: '\\gtreqqless',
				},
				{
					latex: '\\lesssim',
				},
				{
					latex: '\\gtrsim',
				},
				{
					latex: '\\lnsim',
				},
				{
					latex: '\\gnsim',
				},
				{
					latex: '\\lessapprox',
				},
			],
			[
				{
					latex: '\\gtrapprox',
				},
				{
					latex: '\\lnapprox',
				},
				{
					latex: '\\gnapprox',
				},
				{
					latex: '\\vartriangleleft',
				},
				{
					latex: '\\vartriangleright',
				},
				{
					latex: '\\ntriangleleft',
				},
				{
					latex: '\\sqsubset',
				},
				{
					latex: '\\sqsupset',
				},
				{
					latex: '\\sqsubseteq',
				},
				{
					latex: '\\sqsupseteq',
				},
			],
		],
	},
	'arrows-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\leftarrow',
				},
				{
					latex: '\\leftrightarrow',
				},
				{
					latex: '\\rightarrow',
				},
				{
					latex: '\\mapsto',
				},
				{
					latex: '\\longleftarrow',
				},
				{
					latex: '\\longleftrightarrow',
				},
				{
					latex: '\\longrightarrow',
				},
				{
					latex: '\\longmapsto',
				},
				{
					latex: '\\downarrow',
				},
				{
					latex: '\\updownarrow',
				},
				{
					latex: '\\uparrow',
				},
				{
					latex: '\\nwarrow',
				},
				{
					latex: '\\searrow',
				},
				{
					latex: '\\nearrow',
				},
				{
					latex: '\\swarrow',
				},
				{
					latex: '\\textdownarrow',
				},
				{
					latex: '\\textuparrow',
				},
				{
					latex: '\\textleftarrow',
				},
				{
					latex: '\\textrightarrow',
				},
				{
					latex: '\\nleftarrow',
				},
				{
					latex: '\\nleftrightarrow',
				},
				{
					latex: '\\nrightarrow',
				},
				{
					latex: '\\hookleftarrow',
				},
			],
			[
				{
					latex: '\\hookrightarrow',
				},
				{
					latex: '\\twoheadleftarrow',
				},
				{
					latex: '\\twoheadrightarrow',
				},
				{
					latex: '\\leftarrowtail',
				},
				{
					latex: '\\rightarrowtail',
				},
				{
					latex: '\\Leftarrow',
				},
				{
					latex: '\\Leftrightarrow',
				},
				{
					latex: '\\Rightarrow',
				},
				{
					latex: '\\Longleftarrow',
				},
				{
					latex: '\\Longleftrightarrow',
				},
				{
					latex: '\\Longrightarrow',
				},
				{
					latex: '\\Updownarrow',
				},
				{
					latex: '\\Uparrow',
				},
				{
					latex: '\\Downarrow',
				},
				{
					latex: '\\nLeftarrow',
				},
				{
					latex: '\\nLeftrightarrow',
				},
				{
					latex: '\\nRightarrow',
				},
				{
					latex: '\\leftleftarrows',
				},
				{
					latex: '\\leftrightarrows',
				},
				{
					latex: '\\rightleftarrows',
				},
				{
					latex: '\\rightrightarrows',
				},
				{
					latex: '\\downdownarrows',
				},
				{
					latex: '\\upuparrows',
				},
			],
			[
				{
					latex: '\\circlearrowleft',
				},
				{
					latex: '\\circlearrowright',
				},
				{
					latex: '\\curvearrowleft',
				},
				{
					latex: '\\curvearrowright',
				},
				{
					latex: '\\Lsh',
				},
				{
					latex: '\\Rsh',
				},
				{
					latex: '\\looparrowleft',
				},
				{
					latex: '\\looparrowright',
				},
				{
					latex: '\\dashleftarrow',
				},
				{
					latex: '\\dashrightarrow',
				},
				{
					latex: '\\leftrightsquigarrow',
				},
				{
					latex: '\\rightsquigarrow',
				},
				{
					latex: '\\Lleftarrow',
				},
				{
					latex: '\\leftharpoondown',
				},
				{
					latex: '\\rightharpoondown',
				},
				{
					latex: '\\leftharpoonup',
				},
				{
					latex: '\\rightharpoonup',
				},
				{
					latex: '\\rightleftharpoons',
				},
				{
					latex: '\\leftrightharpoons',
				},
				{
					latex: '\\downharpoonleft',
				},
				{
					latex: '\\upharpoonleft',
				},
				{
					latex: '\\downharpoonright',
				},
				{
					latex: '\\upharpoonright',
				},
			],
		],
	},
	'constants-layer': {
		styles: '',
		rows: [
			[
				{
					latex: macros['ImaginaryUnit'].def,
					aside: 'complex/ quaternion imaginary',
					insert: '\\ImaginaryUnit',
				},
				{
					latex: macros['EulerNumber'].def,
					aside: "Euler's number",
					insert: '\\EulerNumber',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['GravitationConstant'].def,
					aside: 'gravitational constant',
					insert: '\\GravitationConstant',
				},
				{
					latex: macros['PlanckConstant'].def,
					aside: 'Planck constant',
					insert: '\\PlanckConstant',
				},
				{
					class: 'separator w10',
				},
				{
					latex: macros['VacuumMagneticPermeability'].def,
					aside: 'vacuum magnetic permeability',
					insert: '\\VacuumMagneticPermeability',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['MassElectron'].def,
					aside: 'electron mass',
					insert: '\\MassElectron',
				},
			],
			[
				// {
				// 	latex: macros['JQuaternion'].def,
				// 	insert: '\\JQuaternion',
				// 	aside: 'quaternion imaginary',
				// },
				infinity,
				{
					latex: '\\pi',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['SpeedOfLight'].def,
					aside: 'speed of light',
					insert: '\\SpeedOfLight',
				},
				{
					latex: macros['ReducedPlanckConstant'].def,
					aside: 'reduced Planck constant',
					insert: '\\ReducedPlanckConstant',
				},
				{
					latex: macros['BoltzmannConstant'].def,
					aside: 'Boltzmann constant',
					insert: '\\BoltzmannConstant',
				},
				{
					latex: macros['VacuumElectricPermittivity'].def,
					aside: 'vacuum eletctric permittivity',
					insert: '\\VacuumElectricPermittivity',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['MassProton'].def,
					aside: 'proton mass',
					insert: '\\MassProton',
				},
			],
			[
				// {
				// 	latex: macros['KQuaternion'].def,
				// 	insert: '\\KQuaternion',
				// 	aside: 'quaternion imaginary',
				// },
				{
					class: 'separator w10',
				},
				{
					latex: macros['GoldenRatio'].def,
					aside: 'golden ratio',
					insert: '\\GoldenRatio',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['FineStructureConstant'].def,
					aside: 'fine structure constant',
					insert: '\\FineStructureConstant',
				},
				{
					latex: macros['ElementaryCharge'].def,
					aside: 'proton charge',
					insert: '\\ElementaryCharge',
				},
				{
					latex: macros['StefanBoltzmannConstant'].def,
					aside: 'Stefan-Boltzmann constant',
					insert: '\\StefanBoltzmannConstant',
				},
				{
					latex: macros['AvogadroNumber'].def,
					aside: 'Avogadro constant',
					insert: '\\AvogadroNumber',
				},
				{
					class: 'separator w5',
				},
				{
					latex: macros['MassNeutron'].def,
					aside: 'neutron mass',
					insert: '\\MassNeutron',
				},
			],
		],
	},
	'arithmetic-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '+',
					insert: '\\Plus{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\times',
					insert: '\\Multiply{\\placeholder{}}{\\placeholder{}}',
				},
				// {
				// 	latex: '\\pm',
				// 	insert: '\\PlusMinus{\\placeholder{}}{\\placeholder{}}',
				// },
				// {
				// 	latex: '\\ast',
				// 	insert: '\\Asterisk{\\placeholder{}}{\\placeholder{}}',
				// },
				abs,
				sroot,
				exp,
				nlog,
			],
			[
				summation,
				{
					latex: '-',
					insert: '\\Minus{\\placeholder{}}{\\placeholder{}}',
				},
				// {
				// 	latex: '\\mp',
				// 	insert: '\\MinusPlus{\\placeholder{}}{\\placeholder{}}',
				// },
				// {
				// 	latex: '\\circ',
				// 	insert: '\\Circ{\\placeholder{}}{\\placeholder{}}',
				// },
				{
					latex: '\\frac{\\placeholder{}}{\\placeholder{}}',
					insert: '\\Fraction{\\placeholder{}}{\\placeholder{}}',
				},
				nroot,
				a_exp,
				varlog,
			],
		],
	},
	'calculus-layer': {
		styles: '',
		rows: [
			[
				abs,
				summation,
				{
					class: 'separator w15',
				},
				{
					latex: '\\frac{\\mathrm{d}}{\\mathrm{d}\\placeholder{}}',
					insert: '\\Deriv{\\placeholder{}}',
				},
				{
					latex: '\\frac{\\partial}{\\partial\\placeholder{}}',
					insert: '\\PDeriv{\\placeholder{}}',
				},
				{
					latex: '\\nabla\\placeholder{}',
					insert: '\\Gradient{\\placeholder{}}',
				},
				{
					class: 'separator w5',
				},
				{
					latex: intLimits('no'),
					insert: '\\DInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: intLimits(),
					insert: '\\UDInt{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\oint',
					insert: '\\OInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
			],
			[
				sroot,
				exp,
				nlog,
				{
					class: 'separator w5',
				},
				{
					latex: '\\frac{\\mathrm{d}^{\\placeholder{}}}{\\mathrm{d}\\placeholder{}^{\\placeholder{}}}',
					insert: '\\NDeriv{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\frac{\\partial^{\\placeholder{}}}{\\partial\\placeholder{}^{\\placeholder{}}}',
					insert: '\\NPDeriv{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\nabla\\times\\placeholder{}',
					insert: '\\Curl{\\placeholder{}}',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\iint_\\placeholder{}^\\placeholder{}\\nolimits',
					insert: '\\DIInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\iint',
					insert: '\\UDIInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					class: 'separator w10',
				},
			],
			[
				nroot,
				a_exp,
				varlog,
				{
					class: 'separator w5',
				},
				{
					latex: 'd\\placeholder{}',
					insert: '\\Differential{\\placeholder{}}',
				},
				{
					class: 'separator w10',
					// latex: '\\partial\\placeholder{}',
					// insert: '\\PDifferential{\\placeholder{}}',
				},
				{
					latex: '\\nabla\\cdot\\placeholder{}',
					insert: '\\Divergence{\\placeholder{}}',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\iiint_\\placeholder{}^\\placeholder{}\\nolimits',
					insert: '\\DIIInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					latex: '\\iiint',
					insert: '\\UDIIInt{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}{\\placeholder{}}',
				},
				{
					class: 'separator w10',
				},
			],
		],
	},
	'logic-layer': {
		styles: '',
		rows: [
			[
				{
					latex: 't',
					insert: '\\BTrue',
					aside: 'true',
				},
				{
					latex: 'f',
					insert: '\\BFalse',
					aside: 'false',
				},
			],
			[
				{
					latex: '\\vee',
					insert: '\\BOr',
					aside: 'or',
				},
				{
					latex: '\\wedge',
					insert: '\\BAnd',
					aside: 'and',
				},
				{
					latex: '\\neg',
					insert: '\\BNeg',
					aside: 'not',
				},
			],
			// [
			// 	{
			// 		latex: '\\vee',
			// 	},
			// 	{
			// 		latex: '\\Leftarrow',
			// 	},
			// 	{
			// 		latex: '\\Leftrightarrow',
			// 	},
			// 	{
			// 		latex: '\\Rightarrow',
			// 	},
			// ],
			// [
			// 	{
			// 		latex: '\\wedge',
			// 	},
			// 	{
			// 		latex: '\\forall',
			// 	},
			// 	{
			// 		latex: '\\exists',
			// 	},
			// 	{
			// 		latex: '\\neg',
			// 	},
			// ],
		],
	},
	'sets-layer': {
		styles: '',
		rows: [
			[
				infinity,
				{
					// latex: macros['SetNeq'].def,
					// insert: '\\SetNeq',
					latex: '(a, b)',
					insert: '\\SetOpenP\\placeholder{}, \\placeholder{}\\SetCloseP',
					aside: 'open interval',
				},
				// {
				// 	latex: '=',
				// },
				{
					// latex: '<',
					// latex: '\\approx',
					latex: '(a, b]',
					insert: '\\SetOpenP\\placeholder{}, \\placeholder{}\\SetCloseB',
					aside: 'interval',
				},
				{
					// latex: '>',
					// latex: '\\simeq',
					latex: '\\cup',
					aside: 'union',
				},
				// {
				// 	// latex: '\\leq',
				// 	// latex: '\\cong',
				// },
				// {
				// 	// latex: '\\geq',
				// 	// latex: '\\parallel',
				// },
			],
			[
				{
					class: 'separator w10',
				},
				{
					// latex: macros['SetEq'].def,
					// insert: '\\SetEq',
					// latex: '\\leq',
					latex: '[a, b)',
					insert: '\\SetOpenB\\placeholder{}, \\placeholder{}\\SetCloseP',
					aside: 'interval',
				},
				{
					// class: 'separator w10',
					// latex: '\\geq',
					latex: '[a, b]',
					insert: '\\SetOpenB\\placeholder{}, \\placeholder{}\\SetCloseB',
					aside: 'closed interval',
				},
				// {
				// 	// latex: '\\cup',
				// 	// latex: '\\lneq',
				// },
				{
					latex: '\\cap',
					aside: 'intersection',
					// latex: '\\gneq',
				},
				// {
				// 	// latex: '\\setminus',
				// 	// latex: '\\leftarrow',
				// },
				// {
				// 	latex: '\\rightarrow',
				// },
			],
			// [
			// 	{
			// 		latex: '\\subseteq',
			// 	},
			// 	{
			// 		latex: '\\supseteq',
			// 	},
			// 	{
			// 		latex: '\\subsetneq',
			// 	},
			// 	{
			// 		latex: '\\supsetneq',
			// 	},
			// 	{
			// 		latex: '\\cup',
			// 	},
			// 	{
			// 		latex: '\\cap',
			// 	},
			// 	{
			// 		latex: '\\setminus',
			// 	},
			// ],
		],
	},
	'trig-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '\\sin',
					insert: '\\sin(\\placeholder{})',
				},
				{
					latex: '\\arcsin',
					insert: '\\arcsin(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\sinh',
					insert: '\\sinh(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arsinh}',
					insert: '\\operatorname{arsinh}(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\cosec',
					insert: '\\cosec(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arccsc}',
					insert: '\\operatornname{arccsc}(\\placeholder{})',
				},
			],
			[
				{
					latex: '\\cos',
					insert: '\\cos(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arccos}',
					insert: '\\arccos(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\cosh',
					insert: '\\cosh(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arcosh}',
					insert: '\\operatorname{arcosh}(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\sec',
					insert: '\\sec(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arcsec}',
					insert: '\\operatorname{arcsec}(\\placeholder{})',
				},
			],
			[
				{
					latex: '\\tan',
					insert: '\\tan(\\placeholder{})',
				},
				{
					latex: '\\arctan',
					insert: '\\arctan(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\tanh',
					insert: '\\tanh(\\placeholder{})',
				},
				{
					latex: '\\operatorname{artanh}',
					insert: '\\operatorname{artanh}(\\placeholder{})',
				},
				{
					class: 'separator w5',
				},
				{
					latex: '\\cot',
					insert: '\\cot(\\placeholder{})',
				},
				{
					latex: '\\operatorname{arccot}',
					insert: '\\operatorname{arccot}(\\placeholder{})',
				},
			],
		],
	},
	'matrix-layer': {
		styles: '',
		rows: [
			[
				{
					latex: '()',
					insert: '\\begin{pmatrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{pmatrix}',
				},
				{
					latex: '[]',
					insert: '\\begin{bmatrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{bmatrix}',
				},
				{
					latex: '\\{\\}',
					insert: '\\begin{Bmatrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{Bmatrix}',
				},
				{
					class: 'separator w10',
				},
				{
					class: 'small action',
					label: 'Add Row',
					command: 'addRowAfter',
				},
				{
					class: 'small action',
					label: 'Add Column',
					command: 'addColumnAfter',
				},
			],
			[
				{
					latex: '\\langle\\rangle',
					insert: '\\left\\langle\\begin{matrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{matrix}\\right\\rangle',
				},
				{
					latex: '||',
					insert: '\\begin{vmatrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{vmatrix}',
				},
				{
					latex: '\\|\\|',
					insert: '\\begin{Vmatrix}\\placeholder{}&\\placeholder{}\\\\\\placeholder{}&\\placeholder{}\\end{Vmatrix}',
				},
				{
					class: 'separator w10',
				},
				{
					class: 'small action',
					label: 'Remove Row',
					command: 'removeRow',
				},
				{
					class: 'small action',
					label: 'Remove Column',
					command: 'removeColumn',
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
		layer: 'greek-lower-layer',
		layers: ['greek-lower-layer', 'greek-upper-layer'],
	},
	// 'operator-keyboard': {
	// 	label: 'Operators',
	// 	tooltip: 'Operators',
	// 	layer: 'operators-layer',
	// },
	// 'relations-keyboard': {
	// 	label: 'Relations',
	// 	tooltip: 'Relations',
	// 	layer: 'relations-layer',
	// },
	// 'arrows-keyboard': {
	// 	label: 'Arrows',
	// 	tooltip: 'Arrows',
	// 	layer: 'arrows-layer',
	// },
	'constants-keyboard': {
		label: 'Constants',
		tooltip: 'Constants',
		layer: 'constants-layer',
	},
	'arithmetic-keyboard': {
		label: 'Arithmetic',
		tooltip: 'Arithmetic',
		layer: 'arithmetic-layer',
	},
	'calculus-keyboard': {
		label: 'Calculus',
		tooltip: 'Calculus',
		layer: 'calculus-layer',
	},
	'sets-keyboard': {
		label: 'Sets',
		tooltip: 'Sets',
		layer: 'sets-layer',
	},
	'logic-keyboard': {
		label: 'Logic',
		tooltip: 'Logic',
		layer: 'logic-layer',
	},
	'trig-keyboard': {
		label: 'Trig',
		tooltip: 'Trig Functions',
		layer: 'trig-layer',
	},
	'matrix-keyboard': {
		label: 'Matrix',
		tooltip: 'Matrix',
		layer: 'matrix-layer',
	},
};

export { macros, layers, keyboards };

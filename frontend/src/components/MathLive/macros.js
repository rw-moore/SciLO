export const macros = {
	Vector: { args: 1, captureSelection: true, def: '\\overrightarrow{#1}', expand: true },
	CrossProduct: {
		args: 2,
		captureSelection: true,
		def: '\\Vector{#1} \\times \\Vector{#2}',
		expand: true,
	},

	Differential: {
		args: 1,
		captureSelection: true,
		def: '\\mathrm{d#1}',
		expand: true,
	},
	PDifferential: {
		args: 1,
		captureSelection: true,
		def: '\\partial{#1}',
		expand: true,
	},

	// Units
	Centimeter: 'cm',
	Meter: 'm',
	Kilometer: 'km',

	// Constants
	//https://en.wikipedia.org/wiki/List_of_mathematical_constants
	ImaginaryUnit: { def: 'i', expand: false },
	JQuaternion: { def: 'j', expand: false },
	KQuaternion: { def: 'k', expand: false },
	EulerNumber: { def: 'e', expand: false },
	GoldenRatio: { def: '\\varphi', expand: false },

	// https://en.wikipedia.org/wiki/List_of_physical_constants
	GravitationConstant: { def: 'G', expand: false },
	SpeedOfLight: { def: 'c', expand: false },
	PlanckConstant: { def: 'h', expand: false },
	ReducedPlanckConstant: { def: '\\hbar', expand: false },
	VacuumMagneticPermeability: { def: '\\mu_{0}', expand: false },
	VacuumElectricPermittivity: { def: '\\varepsilon_{0}', expand: false },
	BoltzmannConstant: { def: 'k_{B}', expand: false },
	StefanBoltzmannConstant: { def: '\\sigma', expand: false },
	ElementaryCharge: { def: 'e', expand: false },
	FineStructureConstant: { def: '\\alpha', expand: false },

	AvogadroNumber: { def: 'N_{A}', expand: false },
	MassElectron: { def: 'm_e', expand: false },
	MassProton: { def: 'm_p', expand: false },
	MassNeutron: { def: 'm_n', expand: false },

	//Arithmetic Layer
	Plus: {
		args: 2,
		captureSelection: true,
		def: '#1+#2',
		expand: true,
	},
	Multiply: {
		args: 2,
		captureSelection: true,
		def: '#1\\times#2',
		expand: true,
	},
	PlusMinus: {
		args: 2,
		captureSelection: true,
		def: '#1\\pm#2',
		expand: true,
	},
	Asterisk: {
		args: 2,
		captureSelection: true,
		def: '#1\\ast#2',
		expand: true,
	},
	Absolute: {
		args: 1,
		captureSelection: true,
		def: '\\left|#1\\right|',
		expand: true,
	},
	Minus: {
		args: 2,
		captureSelection: true,
		def: '#1-#2',
		expand: true,
	},
	MinusPlus: {
		args: 2,
		captureSelection: true,
		def: '#1\\mp#2',
		expand: true,
	},
	Circ: {
		args: 2,
		captureSelection: true,
		def: '#1\\circ#2',
		expand: true,
	},
	Fraction: {
		args: 2,
		captureSelection: true,
		def: '\\frac{#1}{#2}',
		expand: true,
	},
	Summation: {
		args: 4,
		captureSelection: false,
		def: '\\sum_{#1=#2}^{#3}\\limits#4',
		expand: true,
	},
	SRoot: {
		args: 1,
		captureSelection: true,
		def: '\\sqrt{#1}',
		expand: true,
	},
	NRoot: {
		args: 2,
		captureSelection: true,
		def: '\\sqrt[#1]{#2}',
		expand: false,
	},
	Exp: {
		args: 1,
		captureSelection: true,
		def: '\\EulerConstant^{#1}',
		expand: true,
	},
	AExp: {
		args: 2,
		captureSelection: true,
		def: '#1^{#2}',
		expand: true,
	},

	// Calculus layer
	Deriv: {
		args: 1,
		captureSelection: true,
		def: '\\frac{\\mathrm{d}}{\\Differential{#1}}',
		expand: true,
	},
	PDeriv: {
		args: 1,
		captureSelection: true,
		def: '\\frac{\\partial}{\\PDifferential{#1}}',
		expand: true,
	},
	NDeriv: {
		args: 3,
		captureSelection: true,
		def: '\\frac{\\mathrm{d}^{#1}}{\\Differential{#2^{#3}}}',
		expand: true,
	},
	NPDeriv: {
		args: 3,
		captureSelection: true,
		def: '\\frac{\\partial^{#1}}{\\PDifferential{#2^{#3}}}',
		expand: true,
	},
	Gradient: {
		args: 1,
		captureSelection: true,
		def: '\\nabla#1',
		expand: true,
	},
	Curl: {
		args: 1,
		captureSelection: true,
		def: '\\nabla\\times#1',
		expand: true,
	},
	Divergence: {
		args: 1,
		captureSelection: true,
		def: '\\nabla\\cdot#1',
		expand: true,
	},
	DInt: {
		args: 4,
		captureSelection: true,
		def: '\\int_{#1}^{#2}(#3)\\Differential{#4}',
		expand: true,
	},
	UDInt: {
		args: 2,
		captureSelection: true,
		def: '\\int(#1)\\Differential{#2}',
		expand: true,
	},
	DIInt: {
		args: 7,
		captureSelection: true,
		def: '\\int_{#1}^{#2}\\int_{#3}^{#4}(#5)\\Differential{#6}\\Differential{#7}',
		expand: true,
	},
	UDIInt: {
		args: 3,
		captureSelection: true,
		def: '\\iint(#1)\\Differential{#2}\\Differential{#3}',
		expand: true,
	},
	DIIInt: {
		args: 9,
		captureSelection: true,
		def: '\\int_{#0}^{#1}\\int_{#2}^{#3}\\int_{#4}^{#5}(#6)\\Differential{#7}\\Differential{#8}\\Differential{#9}',
		expand: true,
	},
	UDIIInt: {
		args: 4,
		captureSelection: true,
		def: '\\iiint(#1)\\Differential{#2}\\Differential{#3}\\Differential{#4}',
		expand: true,
	},
	OInt: {
		args: 3,
		captureSelection: true,
		def: '\\oint_{#1}(#2)\\Differential{#3}',
		expand: true,
	},
	BOr: {
		args: 2,
		captureSelection: true,
		def: '#1\\vee#2',
		expand: true,
	},
	BAnd: {
		args: 2,
		captureSelection: true,
		def: '#1\\wedge#2',
		expand: true,
	},
	BNeg: {
		args: 1,
		captureSelection: true,
		def: '\\neg#1',
		expand: true,
	},
	BTrue: { def: 't', expand: false },
	BFalse: { def: 'f', expand: false },

	Arcosh: { def: '\\mathop{arcosh}', expand: true },
	Artanh: { def: '\\mathop{artanh}', expand: true },

	Arccsc: { def: '\\mathop{arccsc}', expand: true },
	Arcsec: { def: '\\mathop{arcsec}', expand: true },
	Arccot: { def: '\\mathop{arccot}', expand: true },
};

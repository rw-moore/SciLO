const getDelims = (type, side = 'l') => {
	switch (type) {
		case 'parenthesis':
			if (side === 'l') {
				return '\\left(';
			}
			return '\\right)';
		case 'brackets':
			if (side === 'l') {
				return '\\left[';
			}
			return '\\right]';
		case 'braces':
			if (side === 'l') {
				return '\\left\\{';
			}
			return '\\right\\}';
		case 'angles':
			if (side === 'l') {
				return '\\left\\langle';
			}
			return '\\right\\rangle';
		case 'pipes':
			if (side === 'l') {
				return '\\left|';
			}
			return '\\right|';
		case 'double_pipes':
			if (side === 'l') {
				return '\\left\\|';
			}
			return '\\right\\|';
		default:
			if (side === 'l') {
				return '\\left.';
			}
			return '\\right.';
	}
};
const setTexEnvironment = (options, preamble) => {
	return `<m>\\renewcommand{\\leftMDelim}{${getDelims(options?.matrix_delimiters)}}
\\renewcommand{\\rightMDelim}{${getDelims(options?.matrix_delimiters, 'r')}}
\\renewcommand{\\leftVDelim}{${getDelims(options?.vector_delimiters)}}
\\renewcommand{\\rightVDelim}{${getDelims(options?.vector_delimiters, 'r')}}
\\renewenvironment{Matrix}[2]{%
    \\leftMDelim\\begin{array}{#1}{#2}
}{%
    \\end{array}\\rightMDelim
}
\\renewenvironment{Matrix*}[1]{%
    \\leftMDelim\\begin{matrix}{#1}
}{%
    \\end{matrix}\\rightMDelim
}
\\renewenvironment{Vector}[2]{%
    \\leftVDelim\\begin{array}{#1}{#2}
}{%
    \\end{array}\\rightVDelim
}
\\renewenvironment{Vector*}[1]{%
    \\leftVDelim\\begin{matrix}{#1}
}{%
    \\end{matrix}\\rightVDelim
}
${preamble}</m>\n`;
};

const isNumeric = (str) => {
	if (typeof str != 'string') return false;
	return !isNaN(str) && !isNaN(parseFloat(str));
};

export { setTexEnvironment, isNumeric };

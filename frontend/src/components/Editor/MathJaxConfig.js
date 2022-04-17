const config = {
	script: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.6/MathJax.js?config=TeX-MML-AM_HTMLorMML',
	options: {
		'fast-preview': {
			disabled: true,
		},
		extensions: ['tex2jax.js', 'mml2jax.js', 'asciimath2jax.js'],
		jax: ['input/TeX', 'output/HTML-CSS'],
		'HTML-CSS': {
			styles: { '.MathJax_Preview': { display: 'none' } },
		},
		tex2jax: {
			inlineMath: [[String.fromCharCode(8288), String.fromCharCode(8288)]],
			displayMath: [[String.fromCharCode(8205), String.fromCharCode(8205)]],
		},
		TeX: {
			extensions: [
				'AMSmath.js',
				'AMSsymbols.js',
				'action.js',
				// "[Extra]/maction.js",        // Stored in index.html(?) MathJax.Ajax.config.path["Extra"] = "%PUBLIC_URL%/js/MathJax";
				// "[Extra]/mtable.js",
				'[Extra]/mathtools.js',
				// "[Extra]/menclose.js",
				// "[Extra]/xypic.js",
			],
		},
	},
};
export default config;

import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { convertLatexToMathMl } from 'mathlive';
import './Mathlive.css';
import { macros, layers, keyboards } from './customKeyboard';
import MathView from './Mathview';
import { MathJaxBaseContext } from 'better-react-mathjax';

export default function MathField(props) {
	const [value, setValue] = useState(props?.value?.latex ?? '');
	useEffect(() => setValue(props?.value?.latex ?? ''), [props.value]);
	const mathRef = useRef(null);
	const mjContext = useContext(MathJaxBaseContext);
	const onChange = useCallback((e) => {
		setValue(e.currentTarget.getValue());
		if (props.onChange) {
			let tab = {
				'math-ml': e.currentTarget.getValue('math-ml'),
				latex: e.currentTarget.getValue('latex'),
				'latex-expanded': e.currentTarget.getValue('latex-expanded'),
				'math-ml-expanded': convertLatexToMathMl(
					e.currentTarget.getValue('latex-expanded')
				),
			};
			if (mjContext) {
				mjContext.promise.then((mjObj) => {
					let JaxToML = {
						toMathML: function (jax, callback) {
							let mml;
							try {
								mml = jax.root.toMathML('');
							} catch (err) {
								if (!err.restart) {
									throw err;
								} // an actual error
								return mjObj.Callback.After(
									[JaxToML.toMathML, jax, callback],
									err.restart
								);
							}
							mjObj.Callback(callback)(mml);
						},
						convert: function (AjaxText, callback) {
							let tempDiv = document.createElement('div');
							tempDiv.setAttribute(
								'style',
								'width:455px;height:450px;border-width:thick;border-style:double;'
							);
							tempDiv.textContent =
								String.fromCharCode(8288) + AjaxText + String.fromCharCode(8288);
							// console.log(tempDiv);
							document.body.appendChild(tempDiv);
							mjObj.Hub.Queue(['Typeset', mjObj.Hub, tempDiv]); //first place in Q
							mjObj.Hub.Queue(function () {
								//wait for a callback to be fired
								let jax = mjObj.Hub.getAllJax(tempDiv);
								for (let i = 0; i < jax.length; i++) {
									JaxToML.toMathML(jax[i], function (mml) {
										//alert(jax[i].originalText + "\n\n=>\n\n"+ mml);
										AjaxText = AjaxText.replace(jax[i].originalText, mml);
									});
								}
								document.body.removeChild(tempDiv);
								// AjaxText = AjaxText.replace(/\(/g, ''); //notice this escape character for ( - i.e it has to be \( , know why it is beacuse JS will treat ) or ( as end/begin of function as there are no quotes here.
								// AjaxText = AjaxText.replace(/\)/g, ''); //notice this escape character for ) - i.e it has to be \)
								// AjaxText = AjaxText.replace(/\\/g, '');
								callback(AjaxText);
							});
						},
					};
					JaxToML.convert(tab['latex-expanded'], function (mml) {
						// console.log('mml', mml);
						tab['mathjax-math-ml'] = mml;
						console.log(tab);
						props.onChange(tab);
					});
				});
			}
		}
	}, []);

	const passedProps = {
		fontsDirectory: null,
		soundsDirectory: null,
		computeEngine: null,
		keypressSound: null,
		plonkSound: null,
		disabled: props.disabled ?? false,
		virtualKeyboardMode: 'manual',
		virtualKeyboardContainer: document.getElementById(props.keyboardContainer) ?? document.body,
		customVirtualKeyboardLayers: layers,
		customVirtualKeyboards: keyboards,
		virtualKeyboards: props?.keyboards?.join(' ') ?? 'alphabet-keyboard',
		onMathFieldBlur: onChange,
		value: value,
	};

	useEffect(() => {
		mathRef.current.setOptions({
			macros: {
				...mathRef.current.getOptions('macros'),
				...macros,
			},
			placeholderSymbol: '⬚',
		});
	}, [mathRef]);

	if (!!props.addonBefore) {
		const wrapperCls = `ant-input-group`;
		const addonCls = `${wrapperCls}-addon`;

		const mergedWrapperClassName = `ant-input-wrapper ${wrapperCls}`;

		const mergedGroupClassName = `ant-input-group-wrapper`;

		return (
			<span className={mergedGroupClassName} style={props.style} hidden={props.hidden}>
				<MathView className={mergedWrapperClassName} {...passedProps} ref={mathRef}>
					<span className={addonCls}>{props.addonBefore}</span>
				</MathView>
			</span>
		);
	}
	return <MathView {...passedProps} ref={mathRef} />;
}

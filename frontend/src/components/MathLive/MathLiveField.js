import React, { useRef, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
import { MathfieldElement, convertLatexToMathMl } from 'mathlive';
import './Mathlive.css';
import { macros, layers, keyboards } from './customKeyboard';

export default function MathField(props) {
	const mathRef = useRef(null);
	const mfe = useMemo(() => {
		console.log(props);
		console.log(document.getElementById(props.keyboardContainer));
		const field = new MathfieldElement({
			fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts/',
			soundsDirectory: 'https://unpkg.com/mathlive/dist/sounds/',
			virtualKeyboardMode: 'manual',
			virtualKeyboardContainer:
				document.getElementById(props.keyboardContainer) ?? document.body,
			customVirtualKeyboardLayers: layers,
			customVirtualKeyboards: keyboards,
			virtualKeyboards: props?.keyboards?.join(' ') ?? 'alphabet-keyboard',
		});
		field.setOptions({
			macros: {
				...field.getOptions('macros'),
				...macros,
			},
			placeholderSymbol: '⬚',
		});
		return field;
	}, []);
	const onChange = useCallback(() => {
		if (props.onChange) {
			let tab = {
				'math-ml': mfe.getValue('math-ml'),
				latex: mfe.getValue('latex'),
				'latex-expanded': mfe.getValue('latex-expanded'),
				'math-ml-expanded': convertLatexToMathMl(mfe.getValue('latex-expanded')),
			};
			console.log(tab);
			console.log(mfe.getOptions());

			props.onChange(convertLatexToMathMl(mfe.getValue('latex-expanded')));
		}
	}, []);
	useLayoutEffect(() => {
		let parent = mathRef.current;
		parent?.appendChild(mfe);
		mfe.value = props?.value ?? '';
		// mfe.setOptions({
		// 	macros: {
		// 		...mfe.getOptions('macros'),
		// 		...macros,
		// 	},
		// });
		return () => {
			parent?.removeChild(parent?.lastChild);
		};
	}, [mfe]);
	useEffect(() => {
		mfe.addEventListener('input', onChange);
		return () => {
			mfe.removeEventListener('input', onChange);
		};
	}, [onChange, mfe]);

	if (!!props.addonBefore) {
		const wrapperCls = `ant-input-group`;
		const addonCls = `${wrapperCls}-addon`;

		const mergedWrapperClassName = `ant-input-wrapper ${wrapperCls}`;

		const mergedGroupClassName = `ant-input-group-wrapper`;

		return (
			<span className={mergedGroupClassName} style={props.style} hidden={props.hidden}>
				<span ref={mathRef} className={mergedWrapperClassName}>
					<span className={addonCls}>{props.addonBefore}</span>
				</span>
			</span>
		);
	}
	return <span ref={mathRef}></span>;
}

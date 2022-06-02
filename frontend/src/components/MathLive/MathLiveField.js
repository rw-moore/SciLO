import React, { useRef, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
import { MathfieldElement } from 'mathlive';
import './Mathlive.css';
import { layers, keyboards } from './customKeyboard';
import { macros } from './macros';

export default function MathField(props) {
	const mathRef = useRef(null);
	const mfe = useMemo(() => {
		return new MathfieldElement({
			fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts/',
			soundsDirectory: 'https://unpkg.com/mathlive/dist/sounds/',
			virtualKeyboardMode: 'manual',
			virtualKeyboardContainer:
				document.getElementById(props.keyboardContainer) ?? document.body,
			customVirtualKeyboardLayers: layers,
			customVirtualKeyboards: keyboards,
			virtualKeyboards: 'alphabet-keyboard greek-keyboard sets-keyboard',
		});
	}, []);
	const onChange = useCallback(() => {
		if (props.onChange) {
			console.log(mfe.getValue('math-ml'));
			console.log(mfe.getValue('latex'));
			props.onChange(mfe.getValue('math-ml'));
		}
	}, []);
	useLayoutEffect(() => {
		mathRef.current?.appendChild(mfe);
		mfe.value = props?.value ?? '';
		mfe.setOptions({
			macros: {
				...mfe.getOptions('macros'),
				...macros,
			},
		});
	}, [mfe]);
	useEffect(() => {
		const container = mfe.getOptions().virtualKeyboardContainer;
		const addMargin = () => {
			let viewportHeight = document.getElementById('root')?.clientHeight;
			if (viewportHeight === undefined) {
				console.error("Can't find root element");
				viewportHeight = window.innerHeight;
			}
			const distanceFromBottomOfScreen = viewportHeight - mfe.getBoundingClientRect().bottom;
			const heightOfVirtualKeyboard = 330;
			const margin = `${heightOfVirtualKeyboard - distanceFromBottomOfScreen}px`;
			console.log('add margin', container.style);
			container.setAttribute('data-oldmargin', container.style.marginBottom || '0px');
			container.style.marginBottom = `calc(${
				container.style.marginBottom || '0px'
			} + ${margin})`;
		};
		const removeMargin = () => {
			console.log('remove margin', container.getAttribute('data-oldmargin'));
			if (container.getAttribute('data-oldmargin')) {
				container.style.marginBottom = container.getAttribute('data-oldmargin');
			}
		};
		mfe.addEventListener('input', onChange);
		mfe.addEventListener('focus', addMargin);
		mfe.addEventListener('blur', removeMargin);
		return () => {
			mfe.removeEventListener('input', onChange);
			mfe.removeEventListener('focus', addMargin);
			mfe.removeEventListener('blur', removeMargin);
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

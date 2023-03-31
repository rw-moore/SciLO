import isEqual from 'lodash.isequal';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';

export const OPTIONS = [
	'createHTML',
	'computeEngine',
	'customVirtualKeyboardLayers',
	'customVirtualKeyboards',
	'defaultMode',
	'fontsDirectory',
	'horizontalSpacingScale',
	'ignoreSpacebarInMathMode',
	'inlineShortcutTimeout',
	'inlineShortcuts',
	'keybindings',
	'keypressSound',
	'keypressVibration',
	'letterShapeStyle',
	'locale',
	'macros',
	'namespace',
	'onBlur',
	'onCommit',
	'onContentDidChange',
	'onContentWillChange',
	'onError',
	'onFocus',
	'onKeystroke',
	'onModeChange',
	'onMoveOutOf',
	'onReadAloudStatus',
	'onSelectionDidChange',
	'onSelectionWillChange',
	'onTabOutOf',
	'onUndoStateDidChange',
	'onUndoStateWillChange',
	'onVirtualKeyboardToggle',
	'overrideDefaultInlineShortcuts',
	'plonkSound',
	'readAloudHook',
	'readOnly',
	'removeExtraneousParentheses',
	'scriptDepth',
	'soundsDirectory',
	'smartFence',
	'smartMode',
	'smartSuperscript',
	'speakHook',
	'speechEngine',
	'speechEngineRate',
	'speechEngineVoice',
	'strings',
	'substituteTextArea',
	'textToSpeechMarkup',
	'textToSpeechRules',
	'textToSpeechRulesOptions',
	'virtualKeyboardContainer',
	'virtualKeyboardLayout',
	'virtualKeyboardMode',
	'virtualKeyboardTheme',
	'virtualKeyboardToggleGlyph',
	'virtualKeyboards',
];

/**
 * mount/unmount are unhandled
 */
const FUNCTION_MAPPING = {
	/**retargeting onChange to fire input events to match react expected behavior */
	onChange: 'input',
	onInput: 'input',
	/**rename onFocus to prevent name collision */
	onMathFieldFocus: 'focus',
	/**rename onBlur to prevent name collision */
	onMathFieldBlur: 'blur',
	onCommit: 'change',
	//onContentDidChange,
	//onContentWillChange,
	onError: 'math-error',
	onKeystroke: 'keystroke',
	onModeChange: 'mode-change',
	onMoveOutOf: 'focus-out',
	onReadAloudStatus: 'read-aloud-status',
	//onSelectionDidChange: 'selection-did-change',
	onSelectionWillChange: 'selection-will-change',
	//onTabOutOf,
	onUndoStateDidChange: 'undo-state-did-change',
	onUndoStateWillChange: 'undo-state-will-change',
	onVirtualKeyboardToggle: 'virtual-keyboard-toggle',
};

const FUNCTION_PROPS = Object.keys(FUNCTION_MAPPING);

const MAPPING = {
	className: 'class',
	htmlFor: 'for',
};

export function filterConfig(props) {
	const config = {};
	const passProps = {};
	for (const _key in props) {
		const key = MAPPING[_key] || _key;
		let value = props[_key];
		if (FUNCTION_PROPS.indexOf(key) > -1) {
			//  handled by attaching event listeners
		} else if (OPTIONS.indexOf(key) > -1) {
			if (
				React.isValidElement(value) ||
				(value instanceof Array && value.every(React.isValidElement))
			) {
				value = renderToString(value);
			}
			config[key] = value;
		} else {
			if (value) passProps[key] = value;
		}
	}
	return [config, passProps];
}

/**
 * Performance Optimization
 * ------------------------
 * This hook memoizes config in order to prevent unnecessary rendering/changes
 * The hook deemed the new config dep !== previous config dep, hence invoking `setOptions`.
 * This solution will update options only if they have changed is comparison to the previous values (not object containing them),
 *  avoiding uncessary rendering.
 *
 * @param ref
 * @param config
 */
export function useUpdateOptions(ref, config) {
	const configRef = useRef(config);
	useLayoutEffect(() => {
		if (!isEqual(configRef.current, config)) {
			ref.current?.setOptions(config);
			configRef.current = config;
		}
	}, [ref, config, configRef]);
	// set options after rendering for first rendering pass, by then the mathfield has mounted and is able to receive it, before it mounted nothing happens
	useEffect(() => {
		ref.current?.setOptions(config);
	}, []);
}

export function useEventRegistration(ref, props) {
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const fns = Object.keys(props)
			.filter(
				(key) =>
					typeof props[key] === 'function' &&
					FUNCTION_PROPS.indexOf(MAPPING[key] || key) > -1
			)
			.map((key) => {
				return {
					key: FUNCTION_MAPPING[MAPPING[key] || key],
					fn: (...args) => {
						props[key](...args);
					},
				};
			});

		fns.forEach(({ key, fn }) => {
			node.addEventListener(key, fn);
		});

		return () => {
			fns.forEach(({ key, fn }) => node.removeEventListener(key, fn));
		};
	}, [ref, props]);
}

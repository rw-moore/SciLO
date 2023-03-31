// import 'mathlive/dist/mathlive-fonts.css';
// import 'mathlive/dist/mathlive.min.mjs';
import 'mathlive';
import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { filterConfig, useEventRegistration, useUpdateOptions } from './utils';

const MathView = React.forwardRef((props, ref) => {
	const _ref = useRef(null);
	useImperativeHandle(ref, () => _ref.current, [_ref]);
	const value = useMemo(
		() => (props.children ? renderToString(props.children) : props.value || ''),
		[props.children, props.value]
	);
	const [config, passProps] = useMemo(() => filterConfig(props), [props]);
	useEventRegistration(_ref, props);
	useUpdateOptions(_ref, config);
	useEffect(() => {
		_ref.current?.setValue(value);
	}, [value]);
	return (
		<math-field {...passProps} onChange={undefined} ref={_ref}>
			{value}
		</math-field>
	);
});

export default MathView;

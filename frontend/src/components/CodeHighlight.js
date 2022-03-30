import React, { useEffect, useState } from 'react';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import XmlRender from './Editor/XmlRender';
import Spoiler from './Spoiler';

const highlightByLanguage = (language) => {
	switch (language) {
		case 'sage':
			return languages.python;
		case 'gap':
			return languages.gap;
		case 'gp':
			return languages.parigp;
		case 'html':
			return languages.html;
		case 'r':
			return languages.r;
		default:
			return languages.clike;
	}
};

export default function CodeHighlight(props) {
	const [code, setCode] = useState(null);
	useEffect(() => {
		setCode(
			highlight(
				props.value || props.children,
				highlightByLanguage(props.language)
			)
		);
	}, [props.value, props.children, props.language]);
	return (
		<Spoiler>
			<XmlRender
				style={{ lineHeight: 1.5 }}
			>{`<span>${code}</span>`}</XmlRender>
		</Spoiler>
	);
}

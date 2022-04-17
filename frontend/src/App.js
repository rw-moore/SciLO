import React from 'react';
import './App.css';
import BasicLayout from './layouts/BasicLayout';
import { MathJaxContext } from 'better-react-mathjax';
import config from './components/Editor/MathJaxConfig';

export default function App() {
	return (
		<MathJaxContext
			src={config.script}
			config={config.options}
			version={2}
			hideUntilTypeset={'every'}
			onError={(error) => {
				console.warn(error);
				console.log('Encountered a MathJax error.');
			}}
			onLoad={() => {
				console.log('loaded mathjax');
			}}
			onStartup={(mathjax) => {
				mathjax.Hub.processSectionDelay = 0;
			}}
		>
			<BasicLayout />
		</MathJaxContext>
	);
}

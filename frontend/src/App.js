import { GoogleOAuthProvider } from '@react-oauth/google';
import { MathJaxContext } from 'better-react-mathjax';
import React from 'react';
import './App.css';
import config from './components/Editor/MathJaxConfig';
import BasicLayout from './layouts/BasicLayout';

export default function App() {
	return (
		<GoogleOAuthProvider clientId="216032897049-hvr6e75vc4cnb4ulvblh2vq97jqhke75.apps.googleusercontent.com">
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
		</GoogleOAuthProvider>
	);
}

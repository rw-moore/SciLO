import React from 'react';
import './App.css';
import BasicLayout from './layouts/BasicLayout';
import CreateQuestions from './pages/CreateQuestions';

export default class App extends React.Component {
	render() {
		return (
			<BasicLayout>
				{/*<QuestionBankTable/>*/}
				<CreateQuestions />
			</BasicLayout>
		);
	}
}

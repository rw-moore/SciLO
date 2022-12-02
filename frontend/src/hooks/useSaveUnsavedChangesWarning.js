import React, { useState, useEffect } from 'react';
import { Prompt } from 'react-router-dom';

// https://github.com/codegeous/react-component-depot/blob/master/src/hooks/useUnsavedChangesWarning.js
const useUnsavedChangesWarning = (message = 'Are you sure want to discard changes?') => {
	const [isDirty, setDirty] = useState(false);

	useEffect(() => {
		//Detecting browser closing
		window.onbeforeunload = isDirty && (() => message);

		return () => {
			window.onbeforeunload = null;
		};
	}, [isDirty, message]);

	const routerPrompt = <Prompt when={isDirty} message={message} />;

	return [routerPrompt, () => setDirty(true), () => setDirty(false)];
};

export default useUnsavedChangesWarning;

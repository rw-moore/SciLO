import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';

export function UnitsHelper(props) {
	// const openWindow = () => {
	// 	window.open(
	// 		'https://mathjs.org/docs/datatypes/units.html#reference',
	// 		'',
	// 		'height=600,width=600,left=200,top=200'
	// 	);
	// };
	return (
		<a
			title="Help with Units"
			target="_blank"
			rel="noreferrer"
			href={`${window.location.protocol + '//' + window.location.host}/Help/units`}
			className="units-help-icon"
		>
			<QuestionCircleOutlined style={{ color: 'blue' }} />
		</a>
	);
}

import React from 'react';

const PrintObject = (props) => {
	const object = props.children;
	const margin = props.margin || 0;
	return Object.entries(object).map((item) => (
		<div key={item[0]} style={{ marginLeft: props.margin }}>
			{item[0]}:{' '}
			{item[1] && typeof item[1] === 'object' ? (
				<PrintObject margin={margin + 12}>{item[1]}</PrintObject>
			) : (
				<span>{String(item[1])}</span>
			)}
		</div>
	));
};

export default PrintObject;

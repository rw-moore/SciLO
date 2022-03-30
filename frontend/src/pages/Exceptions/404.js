import React from 'react';
import { Alert } from 'antd';
// import SageCellMultiple from "../../components/SageCellMultiple";
// import LatexDisplay from "../../components/LatexDisplay";

/**
 * shown to user if no info should provide at the location
 */
export default class NotFoundException extends React.Component {
	render() {
		return (
			<div>
				<Alert
					style={{ width: '75%', marginLeft: '12.5%' }}
					message="404 - NOT FOUND"
					description="The page you requested cannot be found."
					type="error"
					showIcon
				/>
				{/* <SageCellMultiple/>
                <LatexDisplay/> */}
				{/*<Divider orientation="left">But you can play a game to relax!</Divider>*/}
				{/*<iframe*/}
				{/*title="minigame"*/}
				{/*style={{*/}
				{/*width: "90%",*/}
				{/*marginLeft: "5%",*/}
				{/*height: "70vh"*/}
				{/*}}*/}
				{/*src="https://www.spider-solitaire-game.com/"*/}
				{/*/>*/}
			</div>
		);
	}
}

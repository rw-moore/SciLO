import React from 'react';
import { Avatar, Badge } from 'antd';
import RandomColorBySeed from '../../utils/RandomColorBySeed';
import RandomID from '../../utils/RandomID';

/**
 * User icon
 */
export default class UserIcon extends React.Component {
	getSeed = () => {
		let seed = 0;
		let string =
			this.props.user && this.props.user.length
				? this.props.user
				: RandomID();
		for (let char of string) {
			seed += char.charCodeAt(0);
		}

		return seed;
	};

	render() {
		const seed = this.getSeed();

		return (
			<div style={this.props.style}>
				<Badge count={this.props.count}>
					<Avatar
						size={this.props.size}
						src={this.props.src}
						shape={'square'}
						style={{
							backgroundColor: !this.props.src
								? RandomColorBySeed(seed).bg
								: undefined,
						}}
					>
						<span
							style={{
								fontSize: '3vh',
								color: RandomColorBySeed(seed).fg,
							}}
						>
							{this.props.user ? this.props.user : '?'}
						</span>
					</Avatar>
				</Badge>
			</div>
		);
	}
}

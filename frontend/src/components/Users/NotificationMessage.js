import React from 'react';
import { List, message, Spin } from 'antd';

import InfiniteScroll from 'react-infinite-scroller';
import RandomID from '../../utils/RandomID';
import UserIcon from './UserIcon';

const mockResult = [
	{ id: RandomID(), name: { first: 'Tianqi', last: 'Wang' } },
	{ id: RandomID(), name: { first: 'John', last: 'Doe' } },
];

export default class NotificationMessage extends React.Component {
	state = {
		data: [],
		loading: false,
		hasMore: true,
	};

	componentDidMount() {
		this.fetchData((res) => {
			this.setState({
				data: res.results,
			});
		});
	}

	fetchData = (callback) => {
		setTimeout(() => {
			callback({ results: mockResult });
		}, 500);
	};

	handleInfiniteOnLoad = () => {
		let { data } = this.state;
		this.setState({
			loading: true,
		});
		if (data.length > 14) {
			message.warning('Infinite List loaded all');
			this.setState({
				hasMore: false,
				loading: false,
			});
			return;
		}
		this.fetchData((res) => {
			data = data.concat(res.results);
			this.setState({
				data,
				loading: false,
			});
		});
	};

	render() {
		return (
			<div className="demo-infinite-container">
				<InfiniteScroll
					initialLoad={false}
					pageStart={0}
					loadMore={this.handleInfiniteOnLoad}
					hasMore={!this.state.loading && this.state.hasMore}
					useWindow={false}
				>
					<List
						split={false}
						dataSource={this.state.data}
						renderItem={(item) => (
							<List.Item key={item.id} style={{ marginLeft: 12 }}>
								<List.Item.Meta
									avatar={
										<UserIcon
											user={
												item.name.first.substring(
													0,
													1
												) +
												item.name.last.substring(0, 1)
											}
										/>
									}
									title={
										item.name.first + ' ' + item.name.last
									}
									description={
										<span className="MessageBox">
											On the other hand, we denounce with
											righteous{' '}
											<a href={'https://github.com'}>
												github
											</a>{' '}
											indignation and dislike men who are
											so beguiled and demoralized by the
											charms of pleasure of the moment
										</span>
									}
								/>
							</List.Item>
						)}
					>
						{this.state.loading && this.state.hasMore && (
							<div className="demo-loading-container">
								<Spin />
							</div>
						)}
					</List>
				</InfiniteScroll>
			</div>
		);
	}
}

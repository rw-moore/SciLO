import { Form, message, Select, Spin } from 'antd';
import React from 'react';
import GetTags from '../../networks/GetTags';

const { Option } = Select;

/**
 * fetch existing tags and select / create tags
 */
export default class GetTagsSelectBar extends React.Component {
	_isMounted = false;

	state = {
		data: [],
		value: [],
		fetching: false,
	};

	componentDidMount() {
		this._isMounted = true;
		this.fetchTags();
	}
	componentWillUnmount() {
		this._isMounted = false;
	}

	/* fetch tags */
	fetchTags = () => {
		this.setState({ data: [], fetching: true });
		GetTags(this.props.token).then((data) => {
			if (!this._isMounted) {
				return;
			}
			if (!data || data.status !== 200) {
				message.error('Cannot fetch tags, see browser console for more details.');
				this.setState({
					fetching: false,
				});
			} else {
				this.setState({
					fetching: false,
					data: data.data.tags,
				});
			}
		});
	};

	render() {
		const { fetching, data } = this.state;
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
		};

		return (
			<Form.Item
				label="Tags"
				tooltip={this.props.helpIcon}
				{...formItemLayout}
				name={['tags']}
			>
				<Select
					placeholder="select tags"
					mode="tags"
					style={{ width: '100%' }}
					tokenSeparators={[',']}
					notFoundContent={fetching ? <Spin size="small" /> : null}
				>
					{data.map((d) => (
						<Option key={d.name}>{d.name}</Option>
					))}
				</Select>
			</Form.Item>
		);
	}
}

import { Form, message, Select, Spin } from 'antd';
import React from 'react';
import GetCourses from '../../networks/GetCourses';

const { Option } = Select;

/**
 * fetch existing courses and select course
 */
export default class GetCourseSelectBar extends React.Component {
	_isMounted = false;

	state = {
		data: [],
		value: [],
		fetching: false,
	};

	componentDidMount() {
		this._isMounted = true;
		this.fetchCourses();
	}
	componentWillUnmount() {
		this._isMounted = false;
	}

	/* fetch courses */
	fetchCourses = () => {
		this.setState({ data: [], fetching: true });
		GetCourses(this.props.token).then((data) => {
			if (!this._isMounted) {
				return;
			}
			if (!data || data.status !== 200) {
				message.error('Cannot fetch courses, see browser console for more details.');
				this.setState({
					fetching: false,
				});
			} else {
				this.setState({
					fetching: false,
					data: data.data,
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
				label="Course"
				tooltip={this.props.helpIcon}
				{...formItemLayout}
				name={['course']}
				preserve={true}
				rules={[
					{
						required: this.props.allowEmpty ? !this.props.allowEmpty : true,
						message: 'Please choose a course for the quiz!',
					},
				]}
			>
				<Select
					disabled={!!this.props.value}
					showSearch
					allowClear
					placeholder="Select course"
					style={{ width: '100%' }}
					notFoundContent={fetching ? <Spin size="small" /> : null}
					filterOption={(input, option) =>
						option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
					}
				>
					{data.map((d) => (
						<Option key={d.id}>{`${d.shortname} - ${d.fullname}`}</Option>
					))}
				</Select>
			</Form.Item>
		);
	}
}

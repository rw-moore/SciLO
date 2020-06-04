import {Form, message, Select, Spin} from 'antd';
import React from "react";
import GetCourses from "../../networks/GetCourses";

const { Option } = Select;

/**
 * fetch existing courses and select course
 */
export default class GetCourseSelectBar extends React.Component {
    state = {
        data: [],
        value: [],
        fetching: false,
    };

    componentDidMount() {
        this.fetchCourses();
    };

    /* fetch courses */
    fetchCourses = () => {
        this.setState({ data: [], fetching: true });
        GetCourses(this.props.token).then(
            data => {
                if (!data || data.status !== 200) {
                    message.error("Cannot fetch courses, see console for more details.");
                    this.setState({
                        fetching: false,
                    })
                }
                else {
                    this.setState({
                        fetching: false,
                        data: data.data,
                    });
                }
            }
        );
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
                {...formItemLayout}
            >
                {this.props.form.getFieldDecorator('course', {initialValue: this.props.value?`${this.props.value}`:undefined, preserve: true, rules: [{ required: this.props.allowEmpty?!this.props.allowEmpty:true, message: 'Please choose a course for the quiz!' }]})(
                    <Select
                        disabled={!!(this.props.value)}
                        showSearch
                        allowClear
                        placeholder="select course"
                        style={{ width: '100%' }}
                        notFoundContent={fetching ? <Spin size="small" /> : null}
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {data.map(d => (
                            <Option key={d.id}>{`${d.shortname} - ${d.fullname}`}</Option>
                        ))}
                    </Select>
                )}
            </Form.Item>
        );
    }
}
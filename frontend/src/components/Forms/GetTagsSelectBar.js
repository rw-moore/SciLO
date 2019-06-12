import {message, Select, Spin} from 'antd';
import debounce from 'lodash/debounce';
import React from "react";
import GetTags from "../../networks/GetTags";

const { Option } = Select;

export default class GetTagsSelectBar extends React.Component {
    state = {
        data: [],
        value: [],
        fetching: false,
    };

    componentDidMount() {
        this.fetchTags();
    }
    fetchTags = () => {
        this.setState({ data: [], fetching: true });
        GetTags().then(
            data => {
                if (data.status !== 200) {
                    message.error("Cannot fetch tags, see console for more details.");
                    console.error("FETCH_TAGS_FAILED", data);
                }
                else {
                    this.setState({
                        data: data.data.tags
                    });
                }
            }
        );
    };

    handleChange = value => {
        this.setState({
            value,
        });
    };

    render() {
        const { fetching, data, value } = this.state;
        return (
            <Select
                placeholder="select tags"
                mode="tags"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
                labelInValue
                value={value}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                onChange={this.handleChange}
            >
                {data.map(d => (
                    <Option key={d.name}>{d.name}</Option>
                ))}
            </Select>
        );
    }
}
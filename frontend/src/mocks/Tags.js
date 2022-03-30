/**
 * mock tags
 */
import { Select } from 'antd';
import React from 'react';

const Option = Select.Option;

const tags = ['easy', 'normal', 'hard', 'bonus', 'mathematical'];

export default tags.map((tag) => <Option key={tag}>{tag}</Option>);

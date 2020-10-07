import React from "react";
import {Collapse, Divider, Form} from 'antd';
// import XmlEditor from "../Editor/XmlEditor";
import DecisionTree from "../DecisionTree";
// import {CodeEditor} from "../CodeEditor";

/**
 * Input field form template
 */
export default class DecisionTreeInput extends React.Component {

    /* make sure we have free attempt number fewer than total attempts */
    validateFreeAttempts = (rule, value, callback) => {
        if (value) {
            const attempts = this.props.form.getFieldValue(`responses[${this.props.id}].attempts`);
            if (attempts && attempts < value) {
                callback("Oops, you have more free tries than the total number of attempts.");
            }
        }
        callback()
    };

    render() {
        const Panel = Collapse.Panel;
        const { getFieldDecorator } = this.props.form;

        // form layout css
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        return (
            <Collapse
                defaultActiveKey={[this.props.id]}
                style={{marginBottom: 12}}
            >
            <Panel>
                <div>
                    {/* <Form.Item label="Text" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].text`, { initialValue : this.props.fetched.text, getValueProps: (value) => value ? value.code: ""})(
                            <XmlEditor />)}
                    </Form.Item> */}
                    {/* <Row>
                        <Col span={4}/>
                        <Col span={7}>
                            <Form.Item label="Attempts">
                                {getFieldDecorator(`responses[${this.props.id}].grade_policy.max_tries`,
                                    { initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.max_tries ? this.props.fetched.grade_policy.max_tries : 1})(
                                    <InputNumber
                                        min={0}
                                        max={10}
                                    />)}
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item label="Attempt Deduction">
                                {getFieldDecorator(`responses[${this.props.id}].grade_policy.penalty_per_try`,
                                    { initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.penalty_per_try ? this.props.fetched.grade_policy.penalty_per_try : 20})(
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        formatter={value => `${value}%`}
                                        parser={value => value.replace('%', '')}
                                    />)}
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Free Tries">
                                {getFieldDecorator(`responses[${this.props.id}].grade_policy.free_tries`,
                                    {
                                        initialValue : this.props.fetched.grade_policy && this.props.fetched.grade_policy.free_tries ? this.props.fetched.grade_policy.free_tries : 0,
                                        rules: [
                                            { validator: this.validateFreeAttempts}
                                        ]})(
                                    <InputNumber min={0} max={10} />)}
                            </Form.Item>
                        </Col>
                    </Row> */}
                    {/* <Divider/>
                    <Form.Item label="Local Script" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].type.script`, {
                            initialValue: this.props.fetched.type ? this.props.fetched.type.script : undefined,
                        })(
                            <CodeEditor/>
                            )}
                    </Form.Item> */}
                    <Form.Item label="Tree" {...formItemLayout} style={{overflow: "auto"}}>
                        {getFieldDecorator(`tree`)(
                            <DecisionTree data={this.props.fetched && this.props.fetched.tree} onChange={this.props.onChange}/>)}
                    </Form.Item>
                    <Divider style={{marginBottom: 4}}/>

                    {/* <div style={{float:"right"}}>
                        <Tooltip
                            title="Label of the answer field"
                            arrowPointAtCenter
                        >
                            <Tag>Label</Tag>
                            {getFieldDecorator(`responses[${this.props.id}].type.label`, {initialValue: this.props.fetched.type ? this.props.fetched.type.label : "Answer"})(
                                <Input style={{width: 88}}/>
                            )}
                        </Tooltip>
                        <Divider type="vertical"/>
                        <Tag>Mark</Tag>
                        {getFieldDecorator(`responses[${this.props.id}].mark`,
                            {
                                initialValue : this.props.fetched.mark ? this.props.fetched.mark : 100,
                            })(
                            <InputNumber size="default" min={0} max={100000} />)}
                        {/* storing meta data*/}
                        {/* <span hidden={true}>
                            {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "tree"})(<input/>)}
                        </span>
                    </div>
                    <br/> */}
                </div>
            </Panel>
            </Collapse>
        );
    }
}
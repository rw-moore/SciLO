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
                    <Form.Item label="Tree" {...formItemLayout} style={{overflow: "auto"}}>
                        {getFieldDecorator(`tree`)(
                            <DecisionTree data={this.props.fetched && this.props.fetched} onChange={this.props.onChange}/>)}
                    </Form.Item>
                    <Divider style={{marginBottom: 4}}/>

                </div>
            </Panel>
            </Collapse>
        );
    }
}
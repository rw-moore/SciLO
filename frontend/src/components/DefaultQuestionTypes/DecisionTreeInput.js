import { Collapse, Divider, Form } from 'antd';
import React from "react";
// import XmlEditor from "../Editor/XmlEditor";
import DecisionTree from "../DecisionTree";
// import {CodeEditor} from "../CodeEditor";

/**
 * Input field form template
 */
export default class DecisionTreeInput extends React.Component {

    render() {
        const Panel = Collapse.Panel;

        // form layout css
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        return (
            <Collapse
                defaultActiveKey={[this.props.id]}
            >
                <Panel>
                    <div style={{overflow: "auto"}}>
                        <Form.Item name={"tree"} {...formItemLayout} label="tree">
                            <DecisionTree 
                                tree={this.props.tree}
                                responses={this.props.responses} 
                                onChange={this.props.onChange}
                                form={this.props.form}
                            ></DecisionTree>
                        </Form.Item>
                        <Divider style={{marginBottom: 4}}/>
                    </div>
                </Panel>
            </Collapse>
        );
    }
}
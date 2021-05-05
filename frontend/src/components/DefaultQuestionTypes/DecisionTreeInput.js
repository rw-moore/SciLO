import React from "react";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Collapse, Divider } from 'antd';
// import XmlEditor from "../Editor/XmlEditor";
import DecisionTree from "../DecisionTree";
// import {CodeEditor} from "../CodeEditor";

/**
 * Input field form template
 */
export default class DecisionTreeInput extends React.Component {

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
                    <div style={{overflow: "auto"}}>
                        {getFieldDecorator(`tree`)(
                            <DecisionTree 
                                tree={this.props.tree} 
                                responses={this.props.responses} 
                                onChange={this.props.onChange}
                                form={this.props.form}
                            ></DecisionTree>)}
                        <Divider style={{marginBottom: 4}}/>
                    </div>
                </Panel>
            </Collapse>
        );
    }
}
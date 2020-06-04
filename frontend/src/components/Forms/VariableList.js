import React from 'react';
import {Form} from "antd";
import CodeHighlight from "../CodeHighlight";

export default class VariableList extends React.Component {
    assignColor = (type) => {
        switch (type) {
            case "fixed":
                return "red";
            case "list":
                return "blue";
            case "random":
                return "purple";
            default:
                return "#f00";
        }
    };

    render() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        if (!this.props.variables.length > 0) {
            return <></>
        }

        return (
            <Form.Item
                label="Variables"
                {...formItemLayout}
            >
                {this.props.variables.map((variable, index) =>
                //     (
                //     <Tag
                //         color={this.assignColor(variable.type)}
                //         key={variable.name}
                //         closable
                //         onClose={() => {this.props.removeVariable(index)}}
                //     >
                //         <strong>{variable.name}</strong>: {variable.value.length ? variable.value.toString() : variable.value}
                //     </Tag>
                // )
                        (<CodeHighlight>{variable.value}</CodeHighlight>)
                )}
            </Form.Item>
        )}
}
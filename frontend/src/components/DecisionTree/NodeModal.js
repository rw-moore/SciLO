import React from "react";
import {Col, Divider, Form, Input, InputNumber, Menu, Modal, Radio, Row, Select, Switch, Tag, Tree} from "antd";
import XmlEditor from "../Editor/XmlEditor";
import {calculateMark, renderData} from "./index";
import Spoiler from "../Spoiler";

export const selectNodeType = (props) => {
        const Option = Select.Option;

        // select component which is used to choose a response type
        const group = <Select
            showSearch
            onChange={props.onChange}
            style={{ width: 200 }}
            placeholder="Select a Type"
            optionFilterProp="children"
            filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            <Option value={0}>Score Node</Option>
            <Option value={1}>Decision Node</Option>
            <Option value={2}>Predefined Node</Option>
        </Select>;

        // show the modal
        const addModal = Modal.confirm({
            title: 'Add Node',
            content: group,
            okText: 'OK',
            cancelText: 'Cancel',
            onOk: () => {
                addModal.destroy();
                props.callEditModal();
            }
        });
    };

export default Form.create({ name: 'node_modal' })((props) => {
    const { visible, onClose, form } = props;
    const { getFieldDecorator } = form;
    const handleSubmit = e => {
        e.preventDefault();
        form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                props.callback(values);
                onClose();
                form.resetFields();
            }
        });
    };

    if (!props.data) {  // new
        return <></>
    }

    const boolField = (
        <Form.Item label="Which parent branch leads to the node?">
            {getFieldDecorator('bool', {
                rules: [{
                    required: true,
                    message: "The node need to be attached to a branch.",
                }],
                initialValue: props.data.bool,
                valuePropName: 'checked'
            })(
                <Switch checkedChildren={<span style={{color:"green"}}>True</span>} unCheckedChildren={<span style={{color: "red"}}>False</span>}/>
            )}
        </Form.Item>
    );

    const boolFieldAlter = (
        <Form.Item label="Which parent branch leads to the node? (ignored by root parent)">
            {getFieldDecorator('bool', {
                rules: [{
                    required: true,
                    message: "The node need to be attached to a branch.",

                }],
                initialValue: props.data.bool!==undefined? props.data.bool: true,
            })(
                <Radio.Group>
                    <Radio.Button value={true}><span style={{color:"green"}}>True</span></Radio.Button>
                    <Radio.Button value={false}><span style={{color: "red"}}>False</span></Radio.Button>
                </Radio.Group>,
            )}
        </Form.Item>
    );

    const policy = (
        <Row>
            <Col span={12}>
                <Form.Item label="Policy for children in the TRUE branch">
                    {getFieldDecorator('policy.true', {
                        initialValue: props.data.policy && props.data.policy.true || "sum",
                    })(
                        <Radio.Group>
                            <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                            <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                            <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                        </Radio.Group>,
                    )}
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item label="Policy for children in the FALSE branch">
                    {getFieldDecorator('policy.false', {
                        initialValue: props.data.policy && props.data.policy.false || "sum",
                    })(
                        <Radio.Group>
                            <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                            <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                            <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                        </Radio.Group>,
                    )}
                </Form.Item>
            </Col>
        </Row>
    );

    if (props.data.type === -1) { // edit root node
        return (
            <Modal
                visible={visible}
                title={<span>Edit Root Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e)}}
            >
                <Form layout="vertical">
                    <Form.Item label="Policy for children">
                        {getFieldDecorator('policy.true', {
                            initialValue: props.data.policy || "sum",
                        })(
                            <Radio.Group>
                                <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                                <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                                <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                            </Radio.Group>,
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

    if (props.data.type === 0) {  // edit score node
        return (
            <Modal
                visible={visible}
                title={<span>Edit Score Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e)}}
            >
                <Form layout="vertical">
                    <Form.Item label="Label">
                        {getFieldDecorator('title', {  // in data we actually use 'title'
                            initialValue: props.data.title
                        })(<Input placeholder={"Give a label of the node, can be empty."}/>)}
                    </Form.Item>

                    {boolFieldAlter}

                    <Form.Item label="Score">
                        {getFieldDecorator('score', {
                            rules: [{
                                required: true,
                                message: "You need to give a score."
                            }],
                            initialValue: props.data.score,
                        })(<InputNumber/>)}
                    </Form.Item>

                    <Form.Item label="Feedback">
                        {getFieldDecorator('feedback', {
                            initialValue: props.data.feedback,
                        })(
                            <Input />
                        )}
                    </Form.Item>

                </Form>
            </Modal>
        )
    }

    const range = calculateMark(props.data);

    if (props.data.type === 1) {  // edit decision node
        const render = renderData([props.data], "0")
        return (
            <Modal
                visible={visible}
                title={<span>Edit Decision Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e);}}
                width={720}
            >
                <Form layout="vertical">
                    <Form.Item label="Criteria">
                        {getFieldDecorator('title', {  // in data we actually use 'title'
                            initialValue: props.data.title,
                            rules: [{
                                required: true,
                                message: "You need to give criteria."
                            }],
                        })(<Input placeholder={"Enter an expression, \"_value\" will be replace with student answers."}/>)}
                    </Form.Item>

                    <Form.Item label="Label">
                        {getFieldDecorator('label', {
                            initialValue: props.data.label
                        })(<Input placeholder={"Give a label of the node to display the label instead of the criteria, can be empty."}/>)}
                    </Form.Item>

                    {boolFieldAlter}

                    {policy}

                    <Form.Item label={<span style={{color: "green"}}>Feedback when the criteria are met</span>}>
                        {getFieldDecorator('feedback.true', {
                            initialValue: props.data.feedback ? props.data.feedback.true : undefined,
                        })(
                            <Input />
                        )}
                    </Form.Item>

                    <Form.Item label={<span style={{color: "red"}}>Feedback when the criteria are not met</span>} >
                        {getFieldDecorator('feedback.false', {
                            initialValue: props.data.feedback ? props.data.feedback.false : undefined,
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    {(!!props.data.title) &&
                        <Form.Item label={"Other Info"}>
                            <Spoiler overlay>
                                <div>True Branch Score Range: {range.true.min} ~ {range.true.max}</div>
                                <div>False Branch Score Range: {range.false.min} ~ {range.false.max}</div>
                                <Form.Item label={"Children - view only"}>
                                    <Tree
                                        className="decision-tree"
                                        showIcon
                                        showLine
                                        defaultExpandedKeys={render.map(node=>node.key)}
                                        treeData={render}
                                    />
                                </Form.Item>
                            </Spoiler>
                        </Form.Item>
                    }

                </Form>
            </Modal>
        )
    }

    return null
});
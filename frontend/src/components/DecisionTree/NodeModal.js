import { Col, Form, Input, InputNumber, Modal, Radio, Row, Select, Switch, Tree } from "antd";
import React from "react";
import Spoiler from "../Spoiler";
import { calculateMark, renderData } from "./index";

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
        <Option value={2}>Score Multiple Choice</Option>
        <Option value={3}>Predefined Node</Option>
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

const NodeModal = (props) => {
    const [form] = Form.useForm();
    const { visible, onClose } = props;

    const handleSubmit = e => {
        e.preventDefault();
        form.validateFields().then(values => {
            console.log('Received values of form: ', values);
            props.callback(values);
            onClose();
            form.resetFields();
        }).catch(err => {
            console.error(err);
        });
    };
    React.useEffect(()=>{
        let defaults = {};
        switch (props.data.type) {
            case -1:
                defaults = {
                    policy: {true: props.data.policy || "sum"},
                    allow_negatives: props.data.allow_negatives || false
                }
                break;
            case 0:
                defaults = {
                    title: props.data.title,
                    bool: props.data.bool!==undefined? props.data.bool: true,
                    score: props.data.score,
                    feedback: props.data.feedback
                }
                break;
            case 1:
                defaults = {
                    title: props.data.title,
                    label: props.data.label,
                    bool: props.data.bool!==undefined? props.data.bool: true,
                    policy: {
                        true: (props.data.policy && props.data.policy.true) || "sum",
                        false: (props.data.policy && props.data.policy.false) || "sum"
                    },
                    feedback: {
                        true: props.data.feedback ? props.data.feedback.true : undefined,
                        false: props.data.feedback ? props.data.feedback.false : undefined,
                        error: props.data.feedback ? props.data.feedback.error : "An Error occurred during execution."
                    }
                }
                break;
            case 2:
                defaults = {
                    title: props.data.title,
                    bool: props.data.bool!==undefined? props.data.bool: true,
                    identifier: props.data.identifier,
                    feedback: props.data.feedback,
                    allow_negatives: props.data.allow_negatives || false,
                }
                break;
            default:
                break;
        }
        form.setFieldsValue(defaults);
    }, [form, props])
    const responses = (props.responses && props.responses.reduce(function(map, obj){
        map[obj.identifier] = obj;
        return map;
    }, {})) || {};

    if (!props.data) {  // new
        return <></>
    }

    const boolFieldAlter = (
        <Form.Item 
            label="Which parent branch leads to the node? (ignored by root parent)"
            name="bool"
            rules={[{
                required: true,
                message: "The node need to be attached to a branch.",
            }]}
        >
            <Radio.Group>
                <Radio.Button value={true}><span style={{color:"green"}}>True</span></Radio.Button>
                <Radio.Button value={false}><span style={{color: "red"}}>False</span></Radio.Button>
            </Radio.Group>
        </Form.Item>
    );

    const policy = (
        <Row>
            <Col span={12}>
                <Form.Item 
                    label="Policy for children in the TRUE branch"
                    name={["policy", "true"]}
                >
                    <Radio.Group>
                        <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                        <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                        <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                    </Radio.Group>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item 
                    label="Policy for children in the FALSE branch"
                    name={["policy", "false"]}
                >
                    <Radio.Group>
                        <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                        <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                        <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                    </Radio.Group>
                </Form.Item>
            </Col>
        </Row>
    );

    if (props.data.type === -1) { // edit root node
        return (
            <Modal
                visible={visible}
                forceRender
                title={<span>Edit Root Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e)}}
            >
                <Form 
                    layout="vertical" 
                    form={form}
                    initialValues={{
                        policy: {true: props.data.policy || "sum"},
                        allow_negatives: props.data.allow_negatives || false
                    }}
                >
                    <Form.Item 
                        label="Policy for children"
                        name={["policy", "true"]}
                    >
                        <Radio.Group>
                            <Radio.Button value={"sum"}><span style={{color:"orange"}}>Sum</span></Radio.Button>
                            <Radio.Button value={"max"}><span style={{color: "green"}}>Max</span></Radio.Button>
                            <Radio.Button value={"min"}><span style={{color: "red"}}>Min</span></Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="Allow a negative score for the question."
                        name={"allow_negatives"}
                        valuePropName="checked"
                    >
                        <Switch/>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

    if (props.data.type === 0) {  // edit score node
        return (
            <Modal
                visible={visible}
                forceRender
                title={<span>Edit Score Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e)}}
            >
                <Form 
                    layout="vertical"
                    form={form}
                    initialValues={{
                        title: props.data.title,
                        bool: props.data.bool!==undefined? props.data.bool: true,
                        score: props.data.score,
                        feedback: props.data.feedback
                    }}
                >
                    <Form.Item label="Label" name="title">
                        <Input placeholder={"Give a label of the node, can be empty."}/>
                    </Form.Item>

                    {boolFieldAlter}

                    <Form.Item 
                        label="Score" 
                        name="score"
                        rules={[
                            {
                                required: true,
                                message: "You need to give a score."
                            },
                            ({ getFieldsValue }) => ({
                                validator(_, value) {
                                    // console.log("values", getFieldsValue(true));
                                    return Promise.resolve();
                                }
                            }),
                        ]}
                    >
                        <InputNumber/>
                    </Form.Item>

                    <Form.Item label="Feedback" name="feedback">
                        <Input />
                    </Form.Item>

                </Form>
            </Modal>
        )
    }

    if (props.data.type === 1) {  // edit decision node
        const range = calculateMark(props.data, responses, props.QForm);
        const render = renderData([props.data], "0", responses, props.QForm)
        return (
            <Modal
                visible={visible}
                forceRender
                title={<span>Edit Decision Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e);}}
                width={720}
            >
                <Form 
                    layout="vertical"
                    form={form}
                    initialValues={{
                        title: props.data.title,
                        label: props.data.label,
                        bool: props.data.bool!==undefined? props.data.bool: true,
                        policy: {
                            true: (props.data.policy && props.data.policy.true) || "sum",
                            false: (props.data.policy && props.data.policy.false) || "sum"
                        },
                        feedback: {
                            true: props.data.feedback ? props.data.feedback.true : undefined,
                            false: props.data.feedback ? props.data.feedback.false : undefined,
                            error: props.data.feedback ? props.data.feedback.error : "An Error occurred during execution."
                        }
                    }}
                >
                    <Form.Item 
                        label="Criteria"
                        name="title"
                        rules={[{
                            required: true,
                            message: "You need to give criteria."
                        }]}
                    >
                        <Input placeholder={"Enter an expression, identifiers will be replace with student answers."}/>
                    </Form.Item>

                    <Form.Item label="Label" name="label">
                        <Input placeholder={"Give a label of the node to display the label instead of the criteria, can be empty."}/>
                    </Form.Item>

                    {boolFieldAlter}

                    {policy}

                    <Form.Item 
                        label={<span style={{color: "green"}}>Feedback when the criteria are met</span>}
                        name={["feedback", "true"]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item 
                        label={<span style={{color: "red"}}>Feedback when the criteria are not met</span>}
                        name={["feedback", "false"]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item 
                        label={<span style={{color: "red"}}>Feedback when an error occurs during execution</span>}
                        name={["feedback", "error"]}
                    >
                        <Input />
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

    if (props.data.type === 2) {  // edit score multiple choice node
        const filteredItems = props.responses.filter(resp => resp.type.name==="multiple");
        return (
            <Modal
                visible={visible}
                forceRender
                title={<span>Edit Score Multiple Choice Node</span>}
                okText="Done"
                onCancel={()=>{onClose(); form.resetFields();}}
                onOk={(e)=>{handleSubmit(e)}}
            >
                <Form 
                    layout="vertical"
                    form={form}
                    initialValues={{
                        title: props.data.title,
                        bool: props.data.bool!==undefined? props.data.bool: true,
                        identifier: props.data.identifier,
                        feedback: props.data.feedback,
                        allow_negatives: props.data.allow_negatives || false,
                    }}
                >
                    <Form.Item label="Label" name="title">
                        <Input placeholder={"Give a label of the node, can be empty."}/>
                    </Form.Item>

                    {boolFieldAlter}

                    <Form.Item 
                        label="Identifier" 
                        name="identifier"
                        rules={[
                            {required: true, message: "You must associate this node with a response."}
                        ]}
                    >
                        <Select>
                            {filteredItems.map((item, index) => (
                                <Select.Option key={index} value={item.identifier}>{item.identifier}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Feedback" name="feedback">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Allow this node to score a negative value."
                        name={"allow_negatives"}
                        valuePropName="checked"
                    >
                        <Switch/>
                    </Form.Item>
                </Form>
            </Modal>
        )

    }
    return null
};

export default NodeModal;
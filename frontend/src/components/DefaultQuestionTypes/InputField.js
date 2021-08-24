import { CaretDownOutlined, CaretUpOutlined, DeleteOutlined } from '@ant-design/icons';
import { Col, Collapse, Divider, Form, Input, Row, Select, Tag, Tooltip } from 'antd';
import React from "react";
import XmlEditor from "../Editor/XmlEditor";

/**
 * Input field form template
 */
export default class InputField extends React.Component {

    responsePatterns = [
        {type:"Custom",pattern:"",flags:""}, 
        {type:"Positive Integer",pattern:"^\\d*$",flags:"g"},
        {type:"Integer", pattern:"^-?\\d*$",flags:"g"},
        {type:"Positive Real", pattern:"^\\d*\\.?\\d*$",flags:"g"},
        {type:"Real",pattern:"^-?\\d*\\.?\\d*$",flags:"g"}
    ];
    state = {
        customPatternDisable: this.props.fetched.patterntype !== "Custom"
    }


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
                style={{marginBottom: 12}}
            >
                <Panel
                    header={
                        <span>
                            <Tag
                                onClick={this.props.up}
                                style={{marginLeft: 4}}
                            >
                                <CaretUpOutlined />
                            </Tag>
                            <Tag onClick={this.props.down}>
                                <CaretDownOutlined />
                            </Tag>
                            {this.props.title}
                        </span>
                    }
                    key={this.props.id}
                    extra={
                        <DeleteOutlined onClick={this.props.remove} />
                    }
                    forceRender
                >
                    <Form.Item 
                        label="Text" 
                        {...formItemLayout}
                        name={["responses", this.props.index, "text"]}
                        getValueProps={ (value) => value ? value.code: ""}
                    >
                        <XmlEditor initialValue={this.props.fetched.text}/>
                    </Form.Item>
                    <Form.Item 
                        label="Identifier" 
                        {...formItemLayout}
                        name={["responses", this.props.index, "identifier"]}
                        rules={[
                            {required:true, whitespace:true, message:"Identifier cannot be empty."},
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (value) {
                                        let exists = false;
                                        for (const element of getFieldValue(`responses`)) {
                                            if (element.identifier === value) {
                                                if (exists) {
                                                    return Promise.reject(new Error('All identifiers must be unique.'));
                                                }
                                                exists = true;
                                            }
                                        }
                                    }
                                    return Promise.resolve()
                                }
                            }),
                            {validator: (_, value)=>{this.props.changeIndentifier(value); return Promise.resolve()}},
                        ]}
                        validateFirst= {true}
                    >
                        <Input placeholder="Enter an identifier you want to refer to this response box with"/>
                    </Form.Item>
                    <Row>
                        <Col span={6}>
                            {/*Response Pattern*/}
                            <span>Response Pattern:</span>
                        </Col>
                        <Col span={12}>
                            {/*Pattern*/}
                            <span>Pattern:</span>
                        </Col>
                        <Col span={4}>
                            {/*Patternflags */}
                            <span>Patternflags:</span>
                        </Col>
                    </Row>
                    <Row style={{marginTop:16}}>
                        <Col span={6}>
                            <Form.Item
                                name={["responses", this.props.index, "patterntype"]}
                                noStyle={true}
                            >
                                <Select
                                    onChange={e=>{
                                        var patt = this.responsePatterns.find(val=>val.type===e);
                                        this.setState({customPatternDisable: patt.type!=="Custom"});
                                        if (patt.type === "Custom"){
                                            let newVal = this.props.form.getFieldsValue(true);
                                            newVal.responses[this.props.index].pattern = this.props.fetched.pattern || '';
                                            newVal.responses[this.props.index].patternflag = this.props.fetched.patternflag || '';
                                            this.props.form.setFieldsValue(newVal);
                                        } else {
                                            let newVal = this.props.form.getFieldsValue(true);
                                            newVal.responses[this.props.index].pattern = patt.pattern;
                                            newVal.responses[this.props.index].patternflag = patt.flags;
                                            this.props.form.setFieldsValue(newVal);
                                        }
                                    }}
                                >
                                    {this.responsePatterns.map(patt => <Select.Option key={patt.type} value={patt.type}>{patt.type}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={["responses", this.props.index, "pattern"]}
                                noStyle={true}
                            >
                                <Input disabled={this.state.customPatternDisable}/>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                name={["responses", this.props.index, "patternflag"]}
                                noStyle={true}
                            >
                                <Input disabled={this.state.customPatternDisable}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row style={{marginTop:24}}>
                        <Col span={16}>
                            <span>Pattern Feedback:</span>
                        </Col>
                    </Row>
                    <Row style={{marginTop:16}}>
                        <Col span={16}>
                            <Form.Item
                                name={["responses", this.props.index, "patternfeedback"]}
                                noStyle={true}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider/>
                    <Row>
                        <Col offset={19} span={5}>
                            <Tag>Label</Tag>
                            <Tooltip
                                title="Label of the answer field"
                                arrowPointAtCenter
                            >
                                <Form.Item 
                                    noStyle={true}
                                    name={["responses", this.props.index, "type", "label"]}
                                >
                                    <Input style={{width:88}}/>
                                </Form.Item>
                            </Tooltip>
                        </Col>
                    </Row>
                    <span hidden={true}>
                        <Form.Item
                            noStyle={true}
                            name={["responses", this.props.index, "type", "name"]}
                        >
                            <input/>
                        </Form.Item>
                        <Form.Item
                            noStyle={true}
                            name={["responses", this.props.index, "id"]}
                        >
                            <input/>
                        </Form.Item>
                    </span>
                </Panel>
            </Collapse>
        );
    }
}
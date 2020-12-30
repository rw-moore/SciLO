import React from "react";
import {Col, Collapse, Divider, Form, Icon, Input, InputNumber, Row, Select, Tag, Tooltip} from 'antd';
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

    /* make sure all identifiers are unique */
    validateIdentifiers = (rule, value, callback) => {
        if (value) {
            let exists = false;
            this.props.form.getFieldValue(`responses`).forEach(element => {
                if (element.identifier === value) {
                    if (exists) {
                        console.log('error');
                        callback('All identifiers must be unique.');
                    }
                    exists = true;
                }
            });
        }
        callback()
    }

    getColor = (index) => {
        const grade = this.props.form.getFieldValue(`responses[${this.props.id}].answers[${index}].grade`);
        if (grade >= 100) {
            return "green"
        }
        else if (grade > 0) {
            return "orange"
        }
        else {
            return "magenta"
        }
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
                <Panel
                    header={
                        <span>
                            <Tag
                                onClick={this.props.up}
                                style={{marginLeft: 4}}
                            >
                                <Icon type="caret-up" />
                            </Tag>
                            <Tag onClick={this.props.down}>
                                <Icon type="caret-down" />
                            </Tag>
                            {this.props.title}
                        </span>
                    }
                    key={this.props.id}
                    extra={
                        <Icon
                            type="delete"
                            onClick={this.props.remove}
                        />
                    }
                    forceRender
                >
                    <Form.Item label="Text" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].text`, { initialValue : this.props.fetched.text, getValueProps: (value) => value ? value.code: ""})(
                            <XmlEditor />)}
                    </Form.Item>
                    <Form.Item label="Identifier" {...formItemLayout}>
                        {getFieldDecorator(`responses[${this.props.id}].identifier`, 
                            { 
                                initialValue : this.props.fetched.identifier, 
                                required:true,
                                rules: [
                                    { validator: this.validateIdentifiers, message:"All identifiers should be unique"}
                                ],
                                validateTrigger: ["onBlur", "onChange"]
                            })(
                            <Input placeholder="Enter an identifier you want to refer to this response box with"/>)
                        }
                    </Form.Item>
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
                                            { validator: this.validateFreeAttempts, message: "Oops, you have more free tries than the total number of attempts."}
                                        ]})(
                                    <InputNumber min={0} max={10} />)}
                            </Form.Item>
                        </Col>
                    </Row> */}
                    <Row>
                        <Col span={6}>
                            <Form.Item label="Response Pattern">
                                {getFieldDecorator(`responses[${this.props.id}].patterntype`,
                                {
                                    initialValue:this.props.fetched.patterntype?this.props.fetched.patterntype:"Custom"
                                })(
                                <Select
                                    onChange={e=>{
                                        const formpatt = `responses[${this.props.id}].pattern`
                                        const formflag = `responses[${this.props.id}].patternflag`
                                        var patt = this.responsePatterns.find(val=>val.type===e);
                                        if (patt.type === "Custom"){
                                            this.props.form.setFieldsValue({
                                                [formpatt]: this.props.fetched.pattern || '',
                                                [formflag]: this.props.fetched.patternflag || ''
                                            });
                                        } else {
                                            this.props.form.setFieldsValue({
                                                [formpatt]: patt.pattern,
                                                [formflag]: patt.flags
                                            });
                                        }
                                    }}
                                >
                                    {this.responsePatterns.map(patt => <Select.Option key={patt.type} value={patt.type}>{patt.type}</Select.Option>)}
                                </Select>)}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Pattern">
                                {getFieldDecorator(`responses[${this.props.id}].pattern`,
                                    {
                                        initialValue:this.props.fetched.pattern ? this.props.fetched.pattern : ''
                                    })(
                                        <Input disabled={this.props.form.getFieldValue(`responses[${this.props.id}].patterntype`)!=="Custom"}/>
                                    )}
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label="Patternflag">
                                {getFieldDecorator(`responses[${this.props.id}].patternflag`,
                                    {
                                        initialValue:this.props.fetched.patternflag ? this.props.fetched.patternflag : ''
                                    })(
                                        <Input disabled={this.props.form.getFieldValue(`responses[${this.props.id}].patterntype`)!=="Custom"}/>
                                    )}
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item label="Pattern Feedback">
                                {getFieldDecorator(`responses[${this.props.id}].patternfeedback`,
                                {
                                    initialValue:this.props.fetched.patternfeedback ? this.props.fetched.patternfeedback : ''
                                })(
                                    <Input/>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{float:"right"}}>
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
                        {/* <Tag>Mark</Tag>
                        {getFieldDecorator(`responses[${this.props.id}].mark`,
                            {
                                initialValue : this.props.fetched.mark ? this.props.fetched.mark : 100,
                            })(
                            <InputNumber size="default" min={0} max={100000} />)} */}
                        {/* storing meta data*/}
                        <span hidden={true}>
                            {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "tree"})(<input/>)}
                        </span>
                    </div>
                </Panel>
            </Collapse>
        );
    }
}
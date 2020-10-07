import React from 'react'
import {Button, Collapse, Divider, Form, Icon, Input, Select, Switch, Tag, Tooltip} from "antd";
import {CodeEditor} from "../CodeEditor";

const languages = ["sage", "gap", "gp", "html", "maxima", "octave", "python", "r", "singular"];

export default class SagePlayground extends React.Component {

    state = {
        value: this.props.fetched?this.props.fetched.type.code:undefined
    };

    render() {
        const { TextArea } = Input;
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
                    <div>
                        <Form.Item label="Text" {...formItemLayout}>
                            {getFieldDecorator(`responses[${this.props.id}].text`, { initialValue : this.props.fetched.text})(
                                <TextArea
                                    autosize={{ minRows: 2, maxRows: 6 }}
                                    placeholder="Description of this response"
                                />)}
                        </Form.Item>

                        <Form.Item label="Language" {...formItemLayout}>
                            {getFieldDecorator(`responses[${this.props.id}].type.language`, { initialValue : this.props.fetched.type ? this.props.fetched.type.language : undefined })(
                                <Select
                                    placeholder="Select language"
                                    style={{ width: '100%' }}
                                    onChange={value=>this.setState({lang: value})}
                                >
                                    {languages.map(d => (
                                        <Select.Option key={d}>{d}</Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>

                        <Form.Item label="Codes" {...formItemLayout}>
                            {getFieldDecorator(`responses[${this.props.id}].type.code`, { initialValue : this.props.fetched.type ? this.props.fetched.type.code : undefined })(
                                <code>
                                    <CodeEditor 
                                        language={this.state.lang} 
                                        initValue={this.props.fetched.type ? this.props.fetched.type.code : undefined}
                                        value={this.state.value}
                                        // onChange={(value)=>this.setState({value:value})}
                                    />
                                </code>
                            )}
                        </Form.Item>

                        <Divider>Advanced Settings<Button type={"link"} onClick={() => this.setState({showAdvancedSettings: !this.state.showAdvancedSettings})}>{this.state.showAdvancedSettings ? "hide" : "show"}</Button></Divider>
                        <div hidden={!this.state.showAdvancedSettings}>
                            <Form.Item label="Server" {...formItemLayout}>
                                {getFieldDecorator(`responses[${this.props.id}].type.src`, { preserve: true, initialValue : this.props.fetched.type ? this.props.fetched.type.src : undefined })(
                                    <Input
                                        placeholder="Leave empty to use default server."
                                    />)}
                            </Form.Item>

                            <Form.Item label="Hidden" {...formItemLayout}>
                                {getFieldDecorator(`responses[${this.props.id}].type.params.hide`, {preserve: true, initialValue : this.props.fetched.type && this.props.fetched.type.params ? this.props.fetched.type.params.hide : ["messages", "sessionTitle"] })(
                                    <Select
                                        mode={"multiple"}
                                        placeholder="Select parts to hide"
                                        style={{ width: '100%' }}
                                    >
                                        {["editor", "fullScreen", "language", "evalButton", "permalink", "output", "done", "sessionFiles", "messages", "sessionTitle"].map(d => (
                                            <Select.Option key={d}>{d}</Select.Option>
                                        ))}
                                    </Select>
                                )}
                            </Form.Item>

                            <Form.Item label="Button Text" {...formItemLayout}>
                                {getFieldDecorator(`responses[${this.props.id}].type.params.evalButtonText`, { preserve: true, initialValue : this.props.fetched.type && this.props.fetched.type.params ? this.props.fetched.type.params.evalButtonText : "Evaluate" })(
                                    <Input/>)}
                            </Form.Item>

                            <Divider/>
                            <Tooltip
                                title="This sets whether subsequent session output (future Sage cell evaluations) should replace or be displayed alongside current session output"
                                arrowPointAtCenter
                            >
                                <Tag>Replace Output</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.params.replaceOutput`, {
                                    preserve: true,
                                    initialValue : this.props.fetched.type && this.props.fetched.type.params ? this.props.fetched.type.params.replaceOutput : true,
                                    valuePropName: "checked"
                                })(
                                    <Switch/>
                                )}
                            </Tooltip>
                            <Divider type="vertical"/>
                            <Tooltip
                                title="This sets whether the code from the code option will be immediately evaluated, without the need for pressing a button. Caution! Please use this option sparingly, especially with @interact, to decrease the load on servers. Unless majority of users who open your page are likely to use this cell, let them press a button to trigger evaluation."
                                arrowPointAtCenter
                            >
                                <Tag>Auto Eval</Tag>
                                {getFieldDecorator(`responses[${this.props.id}].type.params.autoeval`, {
                                    preserve: true,
                                    initialValue: this.props.fetched.type && this.props.fetched.type.params ? this.props.fetched.type.params.autoeval : false,
                                    valuePropName: "checked"
                                })(
                                    <Switch/>
                                )}
                            </Tooltip>

                        </div>

                        <span hidden={true}>
                            {getFieldDecorator(`responses[${this.props.id}].type.name`, {initialValue: "sagecell"})(<input/>)}
                        </span>
                        <span hidden={true}>
                            {getFieldDecorator(`responses[${this.props.id}].mark`, {initialValue: 0})(<input/>)}
                        </span>
                    </div>

                </Panel>
            </Collapse>
        );
    }
}
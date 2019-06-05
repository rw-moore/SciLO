import React from "react";

import {Button, Modal, Form, Input, Radio, Select, Tooltip, Icon} from 'antd';

const VariableCreateForm = Form.create({ name: 'VariableCreateForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator, getFieldValue } = form;
            const Option = Select.Option;

            const formItemLayout = {
                labelCol: { span: 4 },
                wrapperCol: { span: 20 },
            };

            return (
                <Modal
                    visible={visible}
                    title="Create a new variable"
                    okText="Create"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form>
                        <Form.Item label="Name" {...formItemLayout} >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: 'Please input the name of the variable!' }],
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="Type" {...formItemLayout} >
                            {getFieldDecorator('type', {
                                initialValue: "fixed",
                            })(
                                <Select style={{ width: '100%' }} onChange={(e)=>{this.setState({type: e})}}>
                                    {["fixed", "list", "random"].map(item=><Option key={item}>{item}</Option>)}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="Value" {...formItemLayout}>
                            {getFieldDecorator('value', {
                                rules: [{ required: true, message: 'Please input the value of the variable!' }],
                            })(
                                getFieldValue("type") === "list" ? // if the type is "list" we render a multiple selection bar, else we render normal input
                                    <Select
                                        mode="tags"
                                        style={{ width: '100%' }}
                                        tokenSeparators={['\n']}
                                        placeholder={
                                            <span>Press <Icon type="enter" /> to add / delete elements.</span>
                                        }/>
                                        :
                                    <Input />
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);

export default class CreateVariableModal extends React.Component {

    handleCancel = () => {
        this.props.close();
    };

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            console.log('Received values of form: ', values);
            form.resetFields();
            this.props.close();
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };

    render() {
        return (
            <VariableCreateForm
                wrappedComponentRef={this.saveFormRef}
                visible={this.props.visible}
                onCancel={this.handleCancel}
                onCreate={this.handleCreate}
            />
        );
    }
}
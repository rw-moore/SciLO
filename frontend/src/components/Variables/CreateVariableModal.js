import React from "react";

import {Button, Modal, Form, Input, Radio, Select} from 'antd';

const VariableCreateForm = Form.create({ name: 'VariableCreateForm' })(
    // eslint-disable-next-line
    class extends React.Component {
        state = {
            type: "fixed"
        };

        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
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
                    <Form layout="vertical">
                        <Form.Item label="Name" {...formItemLayout} >
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: 'Please input the title of collection!' }],
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="Type" {...formItemLayout} >
                            <Select style={{ width: '100%' }} value={this.state.type} onChange={(e)=>{this.setState({type: e})}}>
                                {["fixed", "list", "random"].map(item=><Option key={item}>{item}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Value(s)" {...formItemLayout}>
                            { this.state.type === "list" ?
                                <Select mode="tags" style={{ width: '100%' }} tokenSeparators={['\n']}/> :
                                <Input />
                            }
                        </Form.Item>
                        <Form.Item className="collection-create-form_last-form-item">
                            {getFieldDecorator('modifier', {
                                initialValue: 'public',
                            })(
                                <Radio.Group>
                                    <Radio value="public">Public</Radio>
                                    <Radio value="private">Private</Radio>
                                </Radio.Group>,
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
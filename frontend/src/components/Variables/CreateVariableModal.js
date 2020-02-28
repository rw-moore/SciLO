import React from "react";

import {Modal, Form, Input, Select, Icon} from 'antd';
import {CodeEditor} from "../CodeEditor";

/* the variable creation modal */
const VariableCreateForm = Form.create({ name: 'VariableCreateForm' })(
    class extends React.Component {
        languages = ['Python'];

        renderValueInput() {
            switch (this.props.form.getFieldValue("type")) {
                case "list":
                    return (
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            tokenSeparators={['\n']}
                            placeholder={
                                <span>Press <Icon type="enter" /> to add / delete elements.</span>
                            }
                        />
                    );
                case "fixed":
                    return <Input />;
                case "random":
                    return <Input />;
                case "script":
                    return <code><CodeEditor language={this.state.lang}/></code>
                default:
                    return <Input />;
            }
        }

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
                    <Form.Item
                        label="Value"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('value', {
                            rules: [
                                { required: true, message: 'Please input the value of the variable!' },
                            ],
                        })(
                            <code><CodeEditor language="sage"/></code>
                        )}
                    </Form.Item>
                </Modal>
            )

            // return (
            //     <Modal
            //         visible={visible}
            //         title="Create a new variable"
            //         okText="Create"
            //         onCancel={onCancel}
            //         onOk={onCreate}
            //     >
            //         <Form>
            //             <Form.Item
            //                 label="Name"
            //                 {...formItemLayout}
            //             >
            //                 {getFieldDecorator('name', {
            //                     rules: [
            //                         { required: true, message: 'Please input the name of the variable!' },
            //                         { validator: this.props.validateVariable}
            //                     ],
            //                 })(<Input />)}
            //             </Form.Item>
            //             <Form.Item
            //                 label="Type"
            //                 {...formItemLayout}
            //             >
            //                 {getFieldDecorator('type', {
            //                     initialValue: "fixed",
            //                 })(
            //                     <Select
            //                         style={{ width: '100%' }}
            //                         onChange={(e)=>{this.setState({type: e})}}
            //                     >
            //                         {
            //                             ["fixed", "list", "random", "script"].map(
            //                                 item=><Option key={item}>{item}</Option>
            //                             )
            //                         }
            //                     </Select>
            //                 )}
            //             </Form.Item>
            //             {getFieldValue('type') === 'script' &&
            //                 <Form.Item
            //                     label="Language"
            //                     {...formItemLayout}
            //                 >
            //                     {getFieldDecorator('language', {
            //                         rules: [
            //                             { required: true, message: 'Please select a valid language!' },
            //                         ],
            //                         initialValue: "sage"
            //                     })(
            //                         <Select
            //                             onChange={(e)=>{this.setState({lang: e})}}
            //                         >
            //                             {this.languages.map(lang => (
            //                                 <Option key={lang}>{lang}</Option>
            //                             ))}
            //                         </Select>
            //                     )}
            //                 </Form.Item>
            //             }
            //             <Form.Item
            //                 label="Value"
            //                 {...formItemLayout}
            //             >
            //                 {getFieldDecorator('value', {
            //                     rules: [
            //                         { required: true, message: 'Please input the value of the variable!' },
            //                     ],
            //                 })(
            //                     this.renderValueInput()
            //                 )}
            //             </Form.Item>
            //         </Form>
            //     </Modal>
            // );
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
            values.type = 'script';
            values.language = 'sage';
            console.log('Received values of form: ', values);
            this.props.setVariable(values);
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
                validateVariable={this.props.validateVariable}
                wrappedComponentRef={this.saveFormRef}
                visible={this.props.visible}
                onCancel={this.handleCancel}
                onCreate={this.handleCreate}
            />
        );
    }
}
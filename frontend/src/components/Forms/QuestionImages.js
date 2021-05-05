import React from "react";
import { Card, Collapse, Upload, Icon, Modal } from 'antd';

import UploadList from "antd/es/upload/UploadList";
import en_US from "antd/es/locale-provider/en_US"

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class PicturesWall extends React.Component {
    state = {
        previewVisible: false,
        previewImage: '',
        fileList: [
            {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            },
            {
                uid: '-2',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            },
            {
                uid: '-3',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            },
            {
                uid: '-4',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            },
            {
                uid: '-5',
                name: 'image.png',
                status: 'error',
            },
        ],
    };

    handleCancel = () => {
        this.setState({ previewVisible: false });
    }

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };
    onRemove = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice()
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            }
        });
    }
    beforeUpload = file => {
        this.setState(state => ({
            fileList: [...state.fileList, file]
        }));
        return false;
    }

    render() {
        const { previewVisible, previewImage, fileList } = this.state;
        const Panel = Collapse.Panel;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-tex">Upload</div>
            </div>
        );
        const renderImages = fileList.map((file,index) => {
            file.key = index;
            if (file instanceof File) {
                const file_tmp = {
                    uid: `-${index+1}`,
                    name: file.name,
                    status: "done",
                    url: URL.createObjectURL(file)
                };
                return (
                    <UploadList
                        key={index}
                        listType="picture-card"
                        onPreview={this.handlePreview}
                        onRemove={this.onRemove}
                        items={[file_tmp]}
                        locale={en_US}
                    />
                )
            } else if (typeof file === "object") {
                return (
                    <UploadList
                        key={index}
                        listType="picture-card"
                        onPreview={this.handlePreview}
                        onRemove={this.onRemove}
                        items={[file]}
                        locale={en_US}
                    />
                );
            }
            return <></>
        })
        return (
            <Collapse
                defaultActiveKey={[this.props.id]}
                style={{marginBottom: 12}}
            >
                <Panel>
                    <div className="clearfix">
                        {renderImages}
                        <Upload
                            multiple={true}
                            listType="picture-card"
                            fileList={fileList}
                            showUploadList={false}
                            beforeUpload={this.beforeUpload}
                        >
                            {uploadButton}
                        </Upload>
                        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                            <img alt="example" style={{"width":"100%"}} src={previewImage} />

                        </Modal>
                    </div>
                </Panel>
            </Collapse>
        );
    }
}

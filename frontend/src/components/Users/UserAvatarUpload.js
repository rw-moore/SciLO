import React from 'react';
import {Icon, message, Upload} from 'antd';

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

/**
 * the component for uploading user avatar
 */
export class UserAvatarUpload extends React.Component {
    state = {
        loading: false,
    };

    beforeUpload = (file) => {
        // const isJPG = file.type === 'image/jpeg';
        // if (!isJPG) {
        //     message.error('You can only upload JPG file!');
        // }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        else {
            this.props.setAvatar(file);
        }
        return false;
    };

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                }),
            );
        }
    };

    render() {
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const { image } = this.props;
        return (
            <Upload
                accept="image/*"
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                //action={this.handleUpload}
                beforeUpload={this.beforeUpload}
                onChange={this.handleChange}
            >
                {(image||this.props.url) ? <img src={image?URL.createObjectURL(image):this.props.url} alt="avatar" /> : uploadButton}
            </Upload>
        );
    }
}
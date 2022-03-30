import React, { useState, useCallback } from 'react';
import { Upload, Tooltip, Collapse, Modal } from 'antd';
import { useDrag, useDrop } from 'react-dnd';
import { PlusOutlined } from '@ant-design/icons';

function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
}

const type = 'DraggableUploadList';

const DraggableUploadListItem = ({ originNode, moveRow, file, fileList }) => {
	const ref = React.useRef();
	const index = fileList.indexOf(file);
	const [{ isOver, dropClassName }, drop] = useDrop({
		accept: type,
		collect: (monitor) => {
			const { index: dragIndex } = monitor.getItem() || {};
			if (dragIndex === index) {
				return {};
			}
			return {
				isOver: monitor.isOver(),
				dropClassName:
					dragIndex < index
						? ' drop-over-downward'
						: ' drop-over-upward',
			};
		},
		drop: (item) => {
			moveRow(item.index, index);
		},
	});
	const [, drag] = useDrag({
		type,
		item: { index, file },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});
	drop(drag(ref));
	const errorNode = (
		<Tooltip title="Upload Error">{originNode.props.children}</Tooltip>
	);
	return (
		<div
			ref={ref}
			className={`ant-upload-draggable-list-item ${
				isOver ? dropClassName : ''
			}`}
			style={{ cursor: 'move' }}
		>
			{file.status === 'error' ? errorNode : originNode}
		</div>
	);
};

const PicturesWall = (props) => {
	const { updateState } = props;
	const [fileList, setFileList] = useState(props.images || []);
	const [preview, setPreview] = useState({
		visible: false,
		image: '',
	});

	const moveRow = useCallback(
		(dragIndex, hoverIndex) => {
			const newList = fileList.slice();
			const dragRow = newList[dragIndex];
			newList.splice(dragIndex, 1);
			newList.splice(hoverIndex, 0, dragRow);
			setFileList(newList);
			if (updateState) {
				updateState(newList);
			}
		},
		[fileList, updateState]
	);

	const onChange = (info) => {
		// console.log('onChange',info.fileList);
		setFileList(info.fileList);
		if (updateState) {
			updateState(info.fileList);
		}
	};
	const uploadButton = (
		<div>
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>Upload</div>
		</div>
	);
	const handleCancel = () => {
		setPreview({ visible: false });
	};
	const handlePreview = async (file) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}
		setPreview({
			visible: true,
			image: file.url || file.preview,
		});
	};

	const beforeUpload = (file) => {
		return false;
	};
	return (
		<Collapse defaultActiveKey={[props.id]}>
			<Collapse.Panel>
				<Upload
					accept="image/*"
					fileList={fileList}
					onChange={onChange}
					listType="picture-card"
					beforeUpload={beforeUpload}
					onPreview={handlePreview}
					itemRender={(originNode, file, currFileList) => (
						<DraggableUploadListItem
							originNode={originNode}
							file={file}
							fileList={currFileList}
							moveRow={moveRow}
						/>
					)}
				>
					{uploadButton}
				</Upload>
				<Modal
					visible={preview.visible}
					footer={null}
					onCancel={handleCancel}
				>
					<img
						alt="example"
						style={{ width: '100%' }}
						src={preview.image}
					></img>
				</Modal>
			</Collapse.Panel>
		</Collapse>
	);
};

export default PicturesWall;

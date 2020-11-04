import React, {useEffect, useState} from "react";
import {Button, Dropdown, Icon, Menu, message, Modal, Popover, Tag, Tree, Typography} from 'antd';
import NodeModal, {selectNodeType} from "./NodeModal";
import PrintObject from "../PrintObject";

let mockData = {
    title: "root",
    type: -1,
    policy: "max",
    children: [
        {
            "title": "-50 for everyone",
            "bool": true,
            "type": 0,
            "score": -50,
            "feedback": "you lost 50 marks."
        },
        {
            "title": "50 for everyone",
            "bool": true,
            "type": 0,
            "score": 50,
            "feedback": "you earned 50 marks."
        },
        {
            "title": "_value > 5",
            "label": "is my number > 5",
            "bool": true,
            "type": 1,
            "feedback": {
                "true": "your number is > 5",
                "false": "your number is not > 5"
            },
            "children": [
                {
                    "title": "50 score if my number > 5",
                    "feedback": "you get 50 if your number > 5",
                    "bool": true,
                    "type": 0,
                    "score": 50
                },
                {
                    "title": "_value > 10",
                    "label": "is my number > 10",
                    "bool": true,
                    "type": 1,
                    "feedback": {
                        "true": "your number is > 10",
                        "false": "your number is not > 10"
                    },
                    "children": [
                        {
                            "title": "50 score if my number > 10",
                            "bool": true,
                            "type": 0,
                            "score": 50
                        }
                    ]
                }
            ]
        }
    ]
};

export const calculateMark = (node) => {
    if (node.type === 0) {
        return {false: {min: node.score, max: node.score}, true: {min: node.score, max: node.score}};
    }

    if (!node.children) {
        return {true: {min: 0, max: 0}, false: {min: 0, max: 0}}
    }

    let trueMarks, falseMarks, truePolicy, falsePolicy, trueChildren, falseChildren

    if (node.type === -1) {
        truePolicy = node.policy || "sum";
        trueChildren = node.children;
        trueMarks = trueChildren.map(child => calculateMark(child));
    }

    else {
        truePolicy = (node.policy && node.policy.true) || "sum";
        falsePolicy = (node.policy && node.policy.false) || "sum";

        trueChildren = node.children.filter(n => n.bool === "true" || n.bool === true);
        falseChildren = node.children.filter(n => n.bool === "false" || n.bool === false);

        trueMarks = trueChildren.map(child => calculateMark(child));
        falseMarks = falseChildren.map(child => calculateMark(child));
    }



    let newMin = 0;
    let newMax = 0;

    let trueRange = {min: 0, max: 0};
    let falseRange = {min: 0, max: 0};

    if (trueMarks && trueMarks.length > 0) {
        let acc = {min: 0, max: 0};
        trueMarks.forEach(current => {
            const absMin = Math.min(current.true.min, current.false.min);
            const absMax = Math.max(current.true.max, current.false.max);

            if (truePolicy === "sum") {
                newMin = acc.min + absMin;
                newMax = acc.max + absMax;
            }

            else if (truePolicy === "min") {
                newMin = Math.min(acc.min, absMin);
                newMax = Math.mix(acc.max, absMax);
            }

            else if (truePolicy === "max") {
                newMin = Math.max(acc.min, absMin);
                newMax = Math.max(acc.max, absMax);
            }
            acc = {min: newMin, max: newMax};
        });
        trueRange = acc
    }

    if (node.type === -1) {
        return trueRange
    }

    if (falseMarks && falseMarks.length > 0) {
        let acc = {min: 0, max: 0};
        falseMarks.forEach(current => {
            const absMin = Math.min(current.true.min, current.false.min);
            const absMax = Math.max(current.true.max, current.false.max);

            if (falsePolicy === "sum") {
                newMin = acc.min + absMin;
                newMax = acc.max + absMax;
            }

            else if (falsePolicy === "min") {
                newMin = Math.min(acc.min, absMin);
                newMax = Math.mix(acc.max, absMax);
            }

            else if (falsePolicy === "max") {
                newMin = Math.max(acc.min, absMin);
                newMax = Math.max(acc.max, absMax);
            }
            acc = {min: newMin, max: newMax};
        });
        falseRange = acc
    }

    return {true: trueRange, false: falseRange}
};

export const renderData = (nodes, parentKey, debug) => {
    if (debug === 2) { // trace mode
        return nodes.map((node, index) => {
            let result;
            switch (node.type) {
                case 0:
                    result = renderScoreNode(node, `${parentKey}-${index}`, debug);
                    break;
                case 1:
                    result = renderDecisionNode(node, `${parentKey}-${index}`, debug);
                    break;
                case 2:
                    result = renderScoreMultipleNode(node, `${parentKey}-${index}`, debug);
                    break;
                case 3:
                    result = renderDecisionNode(node, `${parentKey}-${index}`, debug);
                    break;
                default:
                    return node
            }
            if (!result.state) {
                result.disabled = true
            }
            else if (result.state===1) {
                result.icon = <span><Icon type="scissor" /></span>
            }
            return result
        })
    }

    return nodes.map((node, index) => {
        switch (node.type) {
            case 0:
                return renderScoreNode(node, `${parentKey}-${index}`, debug);
            case 1:
                return renderDecisionNode(node, `${parentKey}-${index}`, debug);
            case 2:
                return renderScoreMultipleNode(node, `${parentKey}-${index}`, debug);
            case 3:
                return renderDecisionNode(node, `${parentKey}-${index}`, debug);
            default:
                return node
        }
    })
};

export const genKeys = (nodes, parentKey) => (
    nodes.map((node, index) => (
        {
            ...node,
            key: `${parentKey}-${index}`,
            children: node.children && genKeys(
                node.children, `${parentKey}-${index}`)
        }
    ))
)

export const renderFeedback = (feedback, bool) => (
    typeof feedback === "string" ?
        <Popover placement="right" title="Feedback" content={
            <div>
                <span style={{color: bool? "green": "red"}}>{feedback}</span>
            </div>
        }>
            <Tag color={"cyan"}>Feedback</Tag>
        </Popover>
        :
        <Popover placement="right" title="Feedback" content={
            <div>
                <span style={{color: "green"}}>{feedback.true}</span>
                <br/>
                <span style={{color: "red"}}>{feedback.false}</span>
            </div>
        }>
            <Tag color={"cyan"}>Feedback</Tag>
        </Popover>
)

export const renderDecisionNode = (data, key, debug) => {
    let policy;

    if (data.policy) {
        if (data.policy.true && data.policy.false) {
            policy = <span><b style={{color: "green"}}>{data.policy.true}</b> | <b style={{color: "red"}}>{data.policy.false}</b></span>
        }
        else if (data.policy.true) {
            policy = <b style={{color: "green"}}>{data.policy.true}</b>
        }
        else if (data.policy.false) {
            policy = <b style={{color: "red"}}>{data.policy.false}</b>
        }
    }


    return (
        {
            ...data,
            key: key,
            title: (
                <span>
                    {debug===true &&
                        <Popover placement="left" title="Debug Info" content={
                            <PrintObject>{{ScoreRange: calculateMark(data)}}</PrintObject>
                        }>
                            <Tag color={"blue"}>
                                Debug
                            </Tag>
                        </Popover>
                    }

                    {data.score!==undefined &&
                        <Tag color="blue">
                            Score <b style={{color: data.eval ? "#87d068" : "#f50"}}>{data.score}</b>
                        </Tag>
                    }

                    {data.label ?
                        <Popover title="Criteria" content={<span>{data.title}</span>}>
                            <Tag color={data.bool? "green": "red"}>
                                <b>{data.label}</b>
                            </Tag>
                        </Popover> :
                        <Tag color={data.bool? "green": "red"}>
                            {data.title}
                        </Tag>
                    }

                    {data.type === 2 &&
                        <Tag color={"purple"}>
                            {data.name}: {JSON.stringify(data.params)}
                        </Tag>
                    }

                    {data.policy &&
                        <Tag color={"orange"}>
                            {policy}
                        </Tag>
                    }

                    {
                        data.feedback && renderFeedback(data.feedback, data.eval)
                    }
                </span>
            ),
            icon: (<span><Icon type="branches" /></span>),
            switcherIcon: !data.children && (<Icon type="border" />),
            children: data.children && renderData(
                data.children.sort((a, b) => {  // sort base on bool
                    if (!a.bool && b.bool) {
                        return 1;
                    }
                    if (a.bool && !b.bool) {
                        return -1;
                    }
                    return 0;
                }), key, debug)
        }
    )
};

export const renderScoreNode = (data, key, debug) => (
    {
        ...data,
        key: key,
        title: (
            <span>
                <Tag color={data.bool? "#87d068" : "#f50"}>
                    {data.title} {data.title&&"|"} <Typography.Text strong>{data.score}</Typography.Text>
                </Tag>
                {/*{data.feedback && <span>*/}
                {/*    <Divider type={"vertical"}/>*/}
                {/*    <span style={{color: data.bool? "green": "red"}}>{data.feedback}</span>*/}
                {/*</span>}*/}
                {
                    data.feedback && renderFeedback(data.feedback, data.bool)
                }
            </span>
        ),
        icon: (<Icon type="tag" />),
        switcherIcon: (<Icon type="border" />),
    }
);

export const renderScoreMultipleNode = (data, key, debug) => (
    {
        ...data,
        key: key,
        title: (
            <span>
                <Tag color={data.bool ? "#87d068" : "#f50"}>
                    {data.title} {data.title && "|"} <Typography.Text strong>{data.identifier}</Typography.Text>
                </Tag>
                {
                    data.feedback && renderFeedback(data.feedback, data.bool)
                }
            </span>
        ),
        icon: (<Icon type="tag" />),
        switcherIcon: (<Icon type="border" />),
    }
);

// wrapper see https://github.com/react-component/form/issues/287
export default class DecisionTree extends React.Component {
    render() {
        const {children, ...props} = this.props
        return <DecisionTreeF {...props}>{children}</DecisionTreeF>
    }
}

function DecisionTreeF(props) {
    const [rootPolicy, setRootPolicy] = useState("sum")
    const [tree, setTree] = useState((props.data && props.data.children) || []); // replace [] with mockData.children for example
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedNode, setSelectedNode] = useState();
    const [update, setUpdate] = useState(false);
    const [render, setRender] = useState();
    const [modal, setModal] = useState();
    const [typeToAdd, setTypeToAdd] = useState();
    const [debug, setDebug] = useState(false);

    useEffect(()=>{
        if (update) {
            cacheTree()
        }
    }, [update]);

    useEffect(()=>{
        cacheTree()
    }, []);

    useEffect(()=>{
        setSelectedNode(getSelectedNode())
    }, [selectedKeys]);

    const onChange = (data) => (props.onChange?props.onChange(data):undefined);

    const root = {
        key:"root",
        title: <span>ROOT <Tag color="orange"><b>{rootPolicy}</b></Tag></span>,
        type:-1,
        icon: <Icon type="appstore" />,
    }

    const cacheTree = () => {
        const data = renderData(tree, "0-0", debug);
        setRender({
            ...root,
            children: data
        });
        setUpdate(false);
        onChange({type:-1, policy:rootPolicy, children:tree});
    };

    const onDragEnter = info => {
        console.log(info);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    /* find node from data directly by tracing key value*/

    const trace = (data, key, callback) => {
        const path = key.split('-').slice(2);
        const index = path[path.length-1];
        path.pop();
        let current = data;
        path.forEach(i=>(
            current = current[i].children
        ));
        return callback(current[index], index, current)
    };

    const getSelectedNode = () => {
        if (!selectedKeys || selectedKeys.length < 1) {
            return
        }

        if (selectedKeys[0] === "root") {
            return {key:"root", type:-1, children:tree, policy: rootPolicy}
        }

        return trace(tree, selectedKeys[0], (item, index, arr)=>{
            return item
        });

    };

    const onDrop = info => {
        console.log(info);
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            if (key === "root") {
                return callback({children:_data}, 0, [{children:_data}])
            }

            data.forEach((item, index, arr) => {
                if (item.key === key) {
                    return callback(item, index, arr);
                }
                if (item.children) {
                    return loop(item.children, key, callback);
                }
            });
        };
        let _data = [...tree];
        _data = genKeys(_data, "0-0");

        // test drop object
        let ok = true;
        loop(_data, dropKey, item => {
            if (item.type === 0) {
                message.error("A score node cannot be a parent node.")
                ok = false
            }
        });

        if (!ok) {
            return
        }

        // Find dragObject
        let dragObj;
        loop(_data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(_data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到尾部，可以是随意位置
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(_data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            let ar;
            let i;
            loop(_data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }
        setTree(_data);
        setSelectedKeys([]);
        setUpdate(true);
    };

    const onRemove = () => {
        if (!selectedKeys || selectedKeys.length < 1 || selectedKeys[0] === "root") {
            return
        }

        trace(tree, selectedKeys[0], (item, index, arr)=>{
            arr.splice(index, 1)
        });
        setTree(tree);
        setUpdate(true);
        setSelectedKeys([]);
    };

    const onRemoveConfirm = () => {
        Modal.warning({
            title: 'Delete',
            content: <span>Do you want to delete this node? It will delete <span style={{color: "red"}}>its children</span> as well.</span>,
            onOk: onRemove,
            okCancel: true
        });
    }

    const onAddNode = (node) => {
        if (!selectedKeys || selectedKeys.length < 1) {
            return
        }

        if (selectedKeys[0]==="root") {
            tree.push(node)
        }

        else {
            trace(tree, selectedKeys[0], (item, index, arr)=>{

                item.children = item.children || [];
                item.children.push(node);
            });
        }


        setTree(tree);
        //setSelectedKeys([]);
        setUpdate(true);

    };

    const onChangeNode = (node) => {
        if (!selectedKeys || selectedKeys.length < 1) {
            return
        }

        if (selectedKeys[0]==="root") {
            setRootPolicy(node.policy.true)
        }
        else {
            trace(tree, selectedKeys[0], (item, index, arr)=>{
                arr[index] = node
            });
        }

        setTree(tree);
        //setSelectedKeys([]);
        setUpdate(true);

    };

    const handleNodeChange = (data) => {
        if (modal === "create") {
            onAddNode({...{type:typeToAdd}, ...data})
        }
        else if  (modal === "edit") {
            onChangeNode({...selectedNode, ...data})
        }
    };

    const getMenu = () =>{
        if (!selectedNode || selectedNode.length < 1) {
            return <Menu/>
        }
        if (selectedNode.type === 0) {
            return (
                <Menu style={{maxWidth: 512}}>
                    <Menu.Item key="edit" onClick={()=>{setModal("edit")}}><Icon type={"edit"}/>Edit</Menu.Item>
                    <Menu.Item key="delete" onClick={()=>{
                        Modal.warning({
                            title: 'Delete',
                            content: 'Do you want to delete this node?',
                            onOk: onRemove,
                            okCancel: true
                        });
                    }}><span style={{color: "red"}}><Icon type={"delete"}/>Delete</span></Menu.Item>
                </Menu>
            );
        }

        else if (selectedNode.type === -1) {
            return <Menu/>
        }

        else {
            const range = (!!selectedNode) && calculateMark(selectedNode);
            return (
                <Menu style={{maxWidth: 512}}>
                    <Menu.Item key="1" disabled>True Branch Range: {range.true.min} ~ {range.true.max}</Menu.Item>
                    <Menu.Item key="2" disabled>False Branch Range: {range.false.min} ~ {range.false.max}</Menu.Item>
                    <Menu.Divider/>
                    <Menu.Item key="new" onClick={()=>{
                        selectNodeType({
                            onChange: (e)=>setTypeToAdd(e),
                            callEditModal: ()=>(setModal("create"))
                        })
                    }}>
                        <Icon type={"plus"}/>Add Child Node
                    </Menu.Item>
                    <Menu.Item key="edit" onClick={()=>{setModal("edit")}}><Icon type={"edit"}/>Edit</Menu.Item>
                    <Menu.Item key="delete" onClick={onRemoveConfirm}><span style={{color: "red"}}><Icon type={"delete"}/>Delete</span></Menu.Item>
                </Menu>
            );
        }
    };

    return (
        <div>
            <Button.Group>
            <Button
                type={"primary"}
                icon={"plus"}
                disabled={!selectedKeys || selectedKeys.length < 1 || getSelectedNode().type === 0}
                onClick={()=>(selectNodeType({
                    onChange: (e)=>setTypeToAdd(e),
                    callEditModal: ()=>(setModal("create"))
                }))}
            >Add</Button>
            <Button
                icon={"edit"}
                disabled={!selectedKeys || selectedKeys.length < 1}
                onClick={()=>(setModal("edit"))}
            >Edit</Button>
            <Button
                icon={"delete"}
                type={"danger"}
                disabled={!selectedKeys || selectedKeys.length < 1}
                onClick={onRemoveConfirm}
            >
                Delete
            </Button>
            <Button
                type={"dashed"}
                icon={"bug"}
                onClick={()=>{setDebug(!debug); setUpdate(true)}}
            >
                Debug
            </Button>
            </Button.Group>

            <Dropdown disabled={!selectedKeys || selectedKeys.length < 1} overlay={getMenu()} trigger={['contextMenu']}>
                <div>
                {render && <Tree
                    className="decision-tree"
                    showIcon
                    draggable
                    showLine
                    defaultExpandAll={true}
                    selectedKeys={selectedKeys}
                    onSelect={(e)=>setSelectedKeys(e)}
                    onRightClick={(e)=>(e.node.props.type!==-1&&setSelectedKeys([e.node.props.eventKey]))}
                    onDragEnter={onDragEnter}
                    onDrop={onDrop}
                    treeData={[render]}
                />}
                </div>
            </Dropdown>

            <NodeModal
                callback={handleNodeChange}
                data={
                    modal==="edit"? getSelectedNode() : {type: typeToAdd}
                }
                visible={(!!modal)}
                onClose={()=>(setModal(false))}
            />

        </div>
    );
}
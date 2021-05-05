import React from "react";
import {renderData} from "./index";
import { AppstoreOutlined } from '@ant-design/icons';
import { Tree } from "antd";


export default function TraceResult(props) {

    if (props.data && typeof props.data.children==="object") {
        const children = props.data.children
        const render = renderData(children, "0", 2)
        // console.log(render)
        return (
            <Tree
                className="decision-tree"
                showIcon
                showLine
                defaultExpandAll
                treeData={[{key:"root", title: "ROOT", type:-1, icon: <AppstoreOutlined />, selectable:false, children: render}]}
            />
        );
    }

}
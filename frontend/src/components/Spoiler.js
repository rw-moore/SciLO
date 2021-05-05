import React from "react";
import { Icon as LegacyIcon } from '@ant-design/compatible';
import {Button} from "antd";

export default class Spoiler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };
    }

    shorten = (len) => {
        let target = this.props.children;
        if (target && target.length > len && !this.state.show) {
            target = this.props.children.substring(0,len)+"..."
        }
        return target;
    };

    render() {
        if (typeof this.props.children === 'string') {
            return(
                <span onClick={()=>{this.setState({show: !this.state.show})}} style={this.props.style}>
                    {this.shorten(this.props.length ? this.props.length : 100)}
                </span>
            )
        }

        if (this.props.overlay) {
            return (
                <div>
                    <div style={{maxHeight: !this.state.show ? 32 : undefined, overflow: !this.state.show?'hidden':"auto"}}>
                        <div>{this.props.children}</div>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <Button type={"link"} icon={<LegacyIcon type={!this.state.show?"arrow-down":"arrow-up"} />}
                                onClick={()=>{this.setState({show: !this.state.show})}}>{!this.state.show?"Expand":"Collapse"}
                        </Button>
                    </div>
                </div>
            );
        }

        else {
            return (
                <div style={{maxHeight: !this.state.show ? 32 : undefined, overflow: !this.state.show?'hidden':"auto"}} onClick={()=>{this.setState({show: !this.state.show})}}>
                    <div style={{pointerEvents:"none"}}>{this.props.children}</div>
                </div>
            )
        }

    }
}
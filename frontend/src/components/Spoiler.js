import React from "react";

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
                <span onClick={()=>{this.setState({show: !this.state.show})}}>
                    {this.shorten(this.props.length ? this.props.length : 100)}
                </span>
            )
        }

        else {
            return (
                <div style={{maxHeight: !this.state.show ? 32 : undefined, overflow: 'hidden'}} onClick={()=>{this.setState({show: !this.state.show})}}>
                    <div style={{pointerEvents:"none"}}>{this.props.children}</div>
                </div>
            )
        }

    }
}
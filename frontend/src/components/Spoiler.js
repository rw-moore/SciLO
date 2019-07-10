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
        return(
            <span onClick={()=>{this.setState({show: !this.state.show})}}>
                {this.shorten(this.props.length ? this.props.length : 100)}
            </span>
        )
    }
}
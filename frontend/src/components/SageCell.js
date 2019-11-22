import React, {useEffect, useState} from 'react';

function randomID() {
    return Math.random().toString(36).substr(2, 9)
}

function loadSageScript(url, name, callback, timeout=10) {
    const existingScript = document.getElementById(name);

    if (!existingScript) {
        const script = document.createElement('script');
        script.src = url; // URL for the third-party library being loaded.
        script.id = name;
        document.head.appendChild(script);

        script.onload = () => {
            if (callback) callback();
        };
    }

    if (existingScript && callback) {
        let time = 1;
        const trying = setInterval(()=>{
            if (window.sagecell) {
                callback();
                clearInterval(trying);
            }
            else if (time > timeout) {
                clearInterval(trying);
                console.error("sagecell-react","load script timeout")
            }
            else {
                time++;
            }
        }, 100)
    }
}

export default class SageCell extends React.Component {
    state = {
        hidden: false,
        id: this.props.id ? this.props.id : randomID()
    };

    componentDidMount() {
        loadSageScript(
            this.props.src ? this.props.src : 'https://sagecell.sagemath.org/static/embedded_sagecell.js',
            'SageCellScript',
            ()=>{
                let cellInfo = window.sagecell.makeSagecell({
                    ...{
                        inputLocation: `div.SageCell#${this.state.id}`,
                        evalButtonText: 'Evaluate',
                        linked: true,
                        languages: this.props.language?[this.props.language]:window.sagecell.allLanguages,
                    }, ...this.props.params}
                );
                this.setState({cellInfo});
            }
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.onChange && this.state.cellInfo !== prevState.cellInfo) {
            this.props.onChange(this.state.cellInfo)
        }
    }

    componentWillUnmount() {
        const script = document.getElementById("SageCellScript");
        document.head.removeChild(script);
    }

    render() {
        if (!this.state.hidden) {
            return (
                <div style={{...{marginBottom:'10px'},...this.props.style}}>
                    <div className={"SageCell"}
                         id={this.state.id}
                         onChange={(cell)=>{this.setState({cell})}}
                    >
                        <script type={this.props.language ? this.props.language : "text/x-sage"} id={this.state.id}>
                            {this.props.script ? this.props.script : this.props.children}
                        </script>
                    </div>
                </div>
            );
        }
        else {
            return <React.Fragment/>
        }
    }


}
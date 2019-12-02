import React, {useEffect, useState} from 'react';

function randomID() {
    return "_" + Math.random().toString(36).substr(2, 9)
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
        if (this.props.onChange)
            this.props.onChange(this.props.script ? this.props.script : this.props.children);

        loadSageScript(
            this.props.src ? this.props.src : 'https://sagecell.sagemath.org/static/embedded_sagecell.js',
            'SageCellScript',
            ()=>{
                let inputLocation = `div.SageCell#${this.state.id}`;

                // cellInfo is changed by external script, uncontrolled
                let cellInfo = window.sagecell.makeSagecell({
                    ...{
                        inputLocation: inputLocation,
                        evalButtonText: 'Evaluate',
                        linked: true,
                        languages: this.props.language?[this.props.language]:window.sagecell.allLanguages,
                    }, ...this.props.params}
                );

                // register prop onChange event to the CodeMirror editor, we have to wait until it finishes loading
                if (this.props.onChange) {
                    let time = 1;
                    const trying = setInterval(() => {
                        try {
                            if (document.querySelector(inputLocation)) {
                                const editor = document.querySelector(inputLocation).querySelector(".CodeMirror").CodeMirror;
                                editor.on("change", (e) => {
                                    this.props.onChange(e.getValue())
                                });
                                clearInterval(trying);
                            }
                        } catch (error) {
                            console.error(error);
                        }

                        if (time > 3000) {
                            clearInterval(trying);
                            console.error("sagecell-react", "register onchange event timeout")
                        } else {
                            time++;
                        }
                    }, 100);

                    this.setState({cellInfo});
                    this.props.getCellInfoReference && this.props.getCellInfoReference(cellInfo)
                }
            }
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if (this.props.onChange && this.state.cellInfo !== prevState.cellInfo) {
        //     this.props.onChange(this.state.cellInfo)
        // }
    }

    componentWillUnmount() {
        const script = document.getElementById("SageCellScript");
        if (script) document.head.removeChild(script);
    }

    render() {
        if (!this.state.hidden) {
            return (
                <div style={{...{marginBottom:'10px'},...this.props.style}}>
                    <div className={"SageCell"}
                         id={this.state.id}
                         onChange={(cell)=>{this.setState({cell})}}
                         key={this.state.id}
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
import React from 'react';

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
            } else if (time > timeout) {
                clearInterval(trying);
                console.error("sagecell-react","load script timeout")
            } else {
                time++;
            }
        }, 100)
        return trying;
    }
}

function wrap_maxima(code) {
    return `
__target = tmp_filename()
with open(__target, 'w') as f:
    f.write("""
${code}
    """)
maxima.eval(("batchload("{}");").format(__target))`
}

export default class SageCell extends React.Component {
    state = {
        hidden: false,
        id: this.props.id ? this.props.id : randomID(),
        try_load: undefined,
        try_register: undefined
    };

    componentDidMount() {

        let try_load = loadSageScript(
            this.props.src ? this.props.src : 'http://127.0.0.1:8888/static/embedded_sagecell.js',
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
                        editor: "codemirror-readonly"
                    }, ...this.props.params}
                );

                // register prop onChange event to the CodeMirror editor, we have to wait until it finishes loading
                let time = 1;
                const try_register = setInterval(() => {
                    try {
                        if (document.querySelector(inputLocation)) {
                            const editor = document.querySelector(inputLocation).querySelector(".CodeMirror").CodeMirror;
                            editor.on("change", (e) => {
                                if (this.props.onChange) {
                                    this.props.onChange(e.getValue());
                                }
                                this.setState({script: e.getValue()})
                            });
                            this.setState({editor: editor, script: editor.getValue()});
                            clearInterval(try_register);
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    if (time > 3000) {
                        clearInterval(try_register);
                        console.error("sagecell-react", "register onchange event timeout")
                    } else {
                        time++;
                    }
                }, 100);

                this.setState({cellInfo, try_register});
                this.props.getCellInfoReference && this.props.getCellInfoReference(cellInfo);
            }
        )
        this.setState({try_load});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.script && this.props.script && prevProps.script !== this.props.script) {
            const cursor = this.state.editor.getCursor();
            let script = this.props.script;
            if (this.props.language === "maxima") {
                script = wrap_maxima(script);
                this.editor.setOption("mode", "python")
            }
            this.state.editor.setValue(script);
            this.state.editor.setCursor(cursor);
            // console.log("update", script);
        }
        // if (this.props.onChange && this.state.cellInfo !== prevState.cellInfo) {
        //     this.props.onChange(this.state.cellInfo)
        // }
    }

    componentWillUnmount() {
        const script = document.getElementById("SageCellScript");
        if (script) document.head.removeChild(script);
        if (this.state.try_load) {
            clearInterval(this.state.clearInterval);
        }
        if (this.state.try_register) {
            clearInterval(this.state.try_register);
        }
    }

    render() {
        if (!this.state.hidden) {
            let language = this.props.language ? this.props.language : "text/x-sage";
            let script = this.props.script ? this.props.script : this.props.children;
            if (this.props.language === "maxima") {
                script = wrap_maxima(script);
                language = "python";
            }
            // console.log("sagecell", script)
            return (
                <div style={{...{marginBottom:'10px'},...this.props.style}}>
                    <div className={"SageCell"}
                         id={this.state.id}
                         onChange={(cell)=>{this.setState({cell})}}
                         key={this.state.id}
                    >
                        <script type={language} id={this.state.id}>
                            {script}
                        </script>
                    </div>
                </div>
            );
        }else {
            return <React.Fragment/>
        }
    }


}
import React, {useEffect, useState} from 'react';
// import useScript from "../hooks/useScript";
import randomID from "../utils/RandomID"
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { PlusCircleOutlined } from '@ant-design/icons';
import {Button, Card} from "antd";

// function SageCellf() {
//     // Declare a new state variable, which we'll call "count"
//     const [cells, setCells] = useState([]);
//     const [refs, setRefs] = useState({});
//
//     //useScript('https://sagecell.sagemath.org/static/embedded_sagecell.js');
//     useScript('http://127.0.0.1:8888/static/embedded_sagecell.js');
//
//     useEffect(() => {
//         if (window.sagecell) {
//             cells.filter(cell=>!(refs[cell])).forEach(cell=> {const cellInfo = createCell(cell); setRefs({...refs, [cell]: cellInfo})})
//         }
//     });
//
//     function createCell(id, ButtonText='Evaluate') {
//         return window.sagecell.makeSagecell({
//             inputLocation: `div.SageCell#${id}`,
//             evalButtonText: ButtonText,
//             linked: true,
//             languages: window.sagecell.allLanguages
//         });
//     }
//
//     return (
//         <div style={{width: "75%", marginLeft: "12.5%", marginTop: "32px"}}>
//             <Button
//                 icon="plus-circle"
//                 type={"primary"}
//                 onClick={() => {
//                     const id = randomID();
//                     setCells([...cells, id]);
//                     // const cellInfo = createCell(id);
//                     // setRefs({...refs, [id]: cellInfo})
//                 }}
//                 style={{width: "100%"}}
//             >
//                 Add a Cell
//             </Button>
//             {cells.map((cell, index) =>
//                 <div className={"SageCellMultiple"} id={cell} style={{marginTop: "32px"}}><script type="text/x-sage" id={cell}>plot(sin(x), (x, 0, 2*pi))</script></div>
//             )}
//             <Button onClick={()=>{console.log(refs)}}>debug</Button>
//         </div>
//     );
// }

function Cell(props) {
    const [cell, setCell] = useState(undefined);

    const id = props.id?props.id:randomID();

    useEffect(() => {
        if (!cell) {
            setCell(createCell(id));
        }
        if (props.callback) {
            props.callback(cell)
        }
    }, [cell, props, id]);

    function createCell(id, ButtonText='Evaluate') {
        return window.sagecell.makeSagecell({
            inputLocation: `div.SageCellMultiple#${id}`,
            evalButtonText: ButtonText,
            linked: true,
            languages: window.sagecell.allLanguages,
        });
    }


    return (
        <Card
            id={"_"+id}
            style={props.style?props.style:{marginTop: "32px"}}
            extra={
                <Button
                    size={"small"}
                    type={"link"}
                    icon={<LegacyIcon type={"delete"} />}
                    onClick={()=>{
                        window.sagecell.deleteSagecell(cell);
                        props.delete()
                    }}
                >
                    Delete
                </Button>
            }
            size={"small"}
        >

            <div className={"SageCellMultiple"}
                 id={id}
            >
                <script type={props.language?props.language:"text/x-sage"} id={id}>
                    {props.children}
                </script>
            </div>
        </Card>
    );
}


export default class SageCellMultiple extends React.Component {
    state = {
        cells: [],
        refs: {}
    };

    componentDidMount () {
        if (!(window.sagecell)) {
            const script = document.createElement("script");
            script.src = this.props.src ? this.props.src : 'http://live.vanillacraft.cn:8888/static/embedded_sagecell.js';
            //script.async = true;
            document.body.appendChild(script);
        }
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (window.sagecell) {
    //         this.state.cells.filter(cell=>!(this.state.refs[cell])).forEach(cell=> {
    //             const cellInfo = this.createCell(cell);
    //             const refs = this.state.refs;
    //             refs[cell] = cellInfo;
    //             this.setState({refs: refs})
    //         })
    //     }
    // }
    //
    // createCell = (id, ButtonText='Evaluate', languages) => {
    //     return window.sagecell.makeSagecell({
    //         inputLocation: `div.SageCellMultiple#${id}`,
    //         evalButtonText: ButtonText,
    //         linked: true,
    //         languages: languages ? languages : window.sagecell.allLanguages
    //     });
    // };

    // renderCells = () => (
    //     this.state.cells.map((cell, index) =>
    //         <div
    //             id = {"_"+cell}
    //             style={{marginTop: "32px"}}
    //         >
    //             <Button
    //                 size={"small"}
    //                 type={"link"}
    //                 icon={"delete"}
    //                 onClick={()=>{
    //                     const cells = this.state.cells;
    //                     const refs = this.state.refs;
    //                     window.sagecell.deleteSagecell(refs[cell]);
    //                     delete refs[cell];
    //                     this.setState({
    //                         cells: cells.filter(c=>c!==cell),
    //                         refs: refs
    //                     });
    //                 }}
    //             >
    //                 Delete
    //             </Button>
    //             <div className={"SageCellMultiple"} id={cell}><script type="text/x-sage" id={cell}>plot(sin(x), (x, 0, 2*pi))</script></div>
    //         </div>
    //     )
    // );
    deleteCell = (id) => {
        const cells = this.state.cells.filter((cell)=>(cell!==id));
        const refs = this.state.refs;
        delete refs[id];
        this.setState({cells: cells, refs: refs})
    };

    setRef = (id, info) => {
        const refs = this.state.refs;
        if (refs[id] !== info) {
            refs[id] = info;
            this.setState({refs});
        }
        console.log(refs)
    };

    render() {
        return (
            <div style={{width: "75%", marginLeft: "12.5%", marginTop: "32px"}}>
                <Button
                    icon={<PlusCircleOutlined />}
                    type={"primary"}
                    onClick={() => {
                        const id = randomID();
                        let cells = this.state.cells;
                        cells.push(id);
                        this.setState({cells: cells});
                    }}
                    style={{width: "100%"}}
                >
                    Add a Cell
                </Button>
                {this.state.cells.map((cell, index)=>
                    <Cell
                        key={cell}
                        id={cell}
                        delete={()=>{this.deleteCell(cell)}}
                        callback={(info)=>{this.setRef(cell, info)}}
                        style={{marginTop: "32px"}}
                    >
                        @interact
                        def f(n=(0,10)):
                            print(2^n)
                    </Cell>
                )}
            </div>
        );
    };

}
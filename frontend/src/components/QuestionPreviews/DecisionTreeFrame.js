import theme from "../../config/theme.json";
import XmlRender from "../Editor/XmlRender";
import {Button, Divider, Input, message, Skeleton, Tag} from "antd";
import React, {useState} from "react";
import axios from "axios";
import ErrorHandler from "../../networks/ErrorHandler";
import TraceResult from "../DecisionTree/TraceResult";

export default function DecisionTreeFrame(props) {
    const [result, setResult] = useState()
    const [marked, setMarked] = useState(false)
    const [value, setValue] = useState()
    const [loading, setLoading] = useState(false)

    // FIXME import from networks/
    const PostData = (data, params={}) => {
        return axios
            .post("http://localhost:8000/api/tree", data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Token b5407764fae8703f1a8e0508d3dbd84b82075918"
                    },
                    params: params
                })
            .then(response => {
                console.log(response);
                return response;
            })
            .catch(ErrorHandler);
    }

    const submit = () => {
        if (loading || !value)
            return

        setResult(undefined);
        setLoading(true)
        const form = {
            input: value,
            tree: props.data.type.tree,
            full: false,
            args: {
                script: (props.script?props.script+"\n":"") + (props.data.type.script || "")
            }
        }
        console.log(form)

        PostData(form).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see console for more details.");
                setLoading(false)
                console.error(data);
            }
            else {
                setResult(data.data)
                setLoading(false)
            }
        });
    }

    return (
        <div
            style={{backgroundColor: theme["@white"], marginBottom: "12px", padding: "12px"}}
            key={props.key}
        >
            <p>
                <XmlRender style={{border: undefined}}>{props.data.text}</XmlRender>
            </p>
            <Input
                addonBefore={props.data.type.label}
                value={value}
                disabled={marked}
                addonAfter={<Button size={"small"} onClick={submit} type={"link"}>Test</Button>}
                onPressEnter={submit}
                onChange={
                    (e)=> {
                        setValue(e.target.value)
                        props.onChange && props.onChange(e)
                    }
                }
            />
            <Skeleton loading={loading} active>
                {(!!result) && <div>
                    <Divider orientation={"left"}>Result</Divider>
                    Your score: <Tag color={"orange"}>{result.score}</Tag>
                    <br/>
                    Your feedback: {result.feedback.map(f=><Tag color={"cyan"}>{f}</Tag>)}
                    <br/>
                    Your Trace:
                    <br/>
                    <TraceResult data={result.trace}/>
                    Timing:
                    <blockquote>{result.time}</blockquote>
                </div>
                }
            </Skeleton>
        </div>
    )
};
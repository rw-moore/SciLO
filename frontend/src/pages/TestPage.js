import React, {useState} from 'react';
import DecisionTree from "../components/DecisionTree";
import {Divider, Input, message, Skeleton, Tag} from "antd";
import axios from "axios";
import ErrorHandler from "../networks/ErrorHandler";
import TraceResult from "../components/DecisionTree/TraceResult";

export default function TestPage(props) {
    const [value, setValue] = useState();
    const mockData = {
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
    const [tree, setTree] = useState(mockData);
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(false);

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
        setResult(undefined);
        setLoading(true)
        const form = {
            input: value,
            tree: tree,
            full: false
        }
        // console.log(form)

        PostData(form).then(data => {
            if (!data || data.status !== 200) {
                message.error("Submit failed, see browser console for more details.");
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
        <div style={{width: "100%", height: "100%",
            background: "white"
        }}>
            <h1>Testing Page</h1>
            <Input.Search style={{width: 250}} value={value} onChange={(e)=>setValue(e.target.value)} onSearch={submit}/>
            <br/>
            <DecisionTree data={tree} onChange={setTree}/>
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
}
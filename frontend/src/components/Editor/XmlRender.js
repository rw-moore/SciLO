import React, {useEffect, useState} from "react";
import XmlConverter from "./XmlConverter";

export default function XmlRender(props) {
    const [code, setCode] = useState(undefined);
    const [valid, setValid] = useState(true);
    const {onChange, question, value, children} = props;

    useEffect(()=>{
        const update = (e,o) => {
            onChange && onChange(e,o);
            setValid(false);
        }
        const jsx = XmlConverter(value || children, {data:question, onChange:update});
        if (jsx) {
            setCode(jsx);
            !valid && setValid(true);
        } else {
            setValid(false);
        }
    }, [valid, value, children, question, onChange]);

    if (props.enable !== undefined && !props.enable) {
        return <></>
    }

    if (props.inline) {
        return (
            <span
                style={{...{border: !props.noBorder ? `solid 1px ${valid ? "#ddd" : "#c39019"}` : undefined, whiteSpace: "pre-line"},...props.style}}
            >
                {code}
            </span>
        )
    }

    return (
        <div
            style={{...{border: !props.noBorder ? `solid 1px ${valid ? "#ddd" : "#c39019"}` : undefined, whiteSpace: "pre-line"},...props.style}}
        >
            {code}
        </div>
    )
}
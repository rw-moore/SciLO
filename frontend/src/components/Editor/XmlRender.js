import React, {useEffect, useState} from "react";
import XmlConverter from "./XmlConverter";

export default function XmlRender(props) {
    const [code, setCode] = useState(undefined);
    const [valid, setValid] = useState(true);
    const {onChange, responses, answers, value, children, disable, images, script} = props;

    useEffect(()=>{
        const update = (e,o) => {
            onChange && onChange(e,o);
            setValid(false);
        }
        const jsx = XmlConverter(value || children, {responses:responses, onChange:update, answers:answers, disabled:disable, images:images, script:script});
        if (jsx) {
            setCode(jsx);
            !valid && setValid(true);
        } else {
            setValid(false);
        }
    }, [valid, value, children, responses, onChange, answers, disable, images, script]);

    if (props.enable !== undefined && !props.enable) {
        return <></>
    }

    if (props.inline) {
        return (
            <span
                style={{...{border: !props.noBorder ? `solid 1px ${valid ? "#ddd" : "#c39019"}` : undefined},...props.style}}
            >
                {code}
            </span>
        )
    }

    return (
        <div
            style={{...{border: !props.noBorder ? `solid 1px ${valid ? "#ddd" : "#c39019"}` : undefined},...props.style}}
        >
            {code}
        </div>
    )
}
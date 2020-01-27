import React from 'react';
import PdfMaker from "../components/Editor/PdfMaker";

export default function TestPage(props) {
    return (
        <div style={{width: "100%", height: "100%"}}>
            <h1>Testing Page</h1>
            <PdfMaker/>
        </div>
    )
}
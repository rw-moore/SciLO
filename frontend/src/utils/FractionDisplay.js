
import React from 'react';
import { Fraction, toTex, Expression } from 'algebra.js';
import { Node, Context } from 'react-mathjax2';
import { InlineMath, BlockMath } from 'react-katex';

function Formula(props) {
    return (
        <Context input="tex">
            <Node inline>{props.tex}</Node>
        </Context>
    );
}

export default function FractionDisplay() {
    const a = new Fraction(1, 5);
    const b = new Fraction(2, 7);
    const answer = a.multiply(b);

    //const question = <Formula tex={`${toTex(a)} × ${toTex(b)} = ${toTex(answer)}`} />;
    const lambda = new Expression("lambda").add(3).divide(4);
    const Phi = new Expression("Phi").subtract(new Fraction(1, 5)).add(lambda);
    const question =  <InlineMath>{toTex(Phi)}</InlineMath>;

    return (
        <div>
            {question}
        </div>
    );
}
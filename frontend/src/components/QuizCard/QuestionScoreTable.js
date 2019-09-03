import React from "react";

export default class QuestionScoreTable extends React.Component {

    render() {
        return (
            <table className="QuestionScoreTable" style={{width: "100%"}}>
                <tbody style={{border: "1px solid black"}}>
                    <tr style={{border: "1px solid black"}}>
                        {this.props.questions.map( (question, index) => (
                            <th key={index} style={{border: "1px solid black", textAlign: "center", width: 64}}>
                                {index}
                            </th>
                        ))}
                    </tr>
                    <tr style={{border: "1px solid black"}}>
                        {this.props.questions.map( (question, index) => (
                                <td key={index} style={{border: "1px solid black", textAlign: "center", width: 64}}>
                                    {question.score} / {question.mark}
                                </td>
                        ))}
                    </tr>
                </tbody>
            </table>

        )
    }
}
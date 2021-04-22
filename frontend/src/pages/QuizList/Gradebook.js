import React from 'react';
import { Button, Descriptions, Divider, message, Table, Tooltip, Typography } from 'antd';
import {Link} from "react-router-dom";
import moment from "moment";
import GetQuizGradebookById from "../../networks/GetQuizGradebookById";

export default class Gradebook extends React.Component {

    state = {
        attempts:{},
        max_num:0
    }
    componentDidMount() {
        this.fetch();
    }
    fetch = (params={}) => {
        GetQuizGradebookById(this.props.id, this.props.token, params).then(data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch quiz ${this.props.id}, see browser console for more details.`);
                console.error("FETCH_FAILED", data);
            } else {
                const quiz = data.data.quiz;
                let attempts = data.data.quiz_attempts;
                let out = {};
                let max_length = 0;
                attempts.forEach(item => {
                    let row_data = {id:item.id, grade:item.grade*100, questions:item.questions};
                    if (item.questions.length > max_length) {
                        max_length = item.questions.length
                    }
                    if (!out[item.user]) {
                        row_data["key"] = 1;
                        out[item.user] = [row_data]
                    } else {
                        row_data['key'] = out[item.user].length;
                        out[item.user].push(row_data)
                    }
                });
                Object.keys(out).forEach(user => {
                    out[user].sort((a, b) => {
                        if (a.id < b.id) {
                            return -1;
                        }
                        return 1;
                    });
                });
                Object.keys(out).forEach(user => {
                    for (let i=0; i<out[user].length; i++) {
                        out[user][i].key = i+1;
                    }
                });
                const ordered = Object.keys(out).sort((a,b)=>{
                    if (out[a].last_name < out[b].last_name) {
                        return -1;
                    } else if (out[a].last_name > out[b].last_name) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    }
                    return 0;
                }).reduce(
                    (obj, key)=> {
                        obj[key] = out[key];
                        return obj;
                    }, {}
                );
                this.setState({
                    quiz: quiz,
                    attempts: ordered,
                    max_num: max_length
                });

            }
        });
    };
    getQuizMethodGrade = (attempts) => {
        let highest = 0;
        let lowest = 0;
        let total = 0;
        let count = 0;
        let latest = 0
        attempts.forEach(item => {
            if (item.grade > highest) {
                highest = item.grade;
            }
            if (item.grade < lowest) {
                lowest = item.grade
            }
            total = total + item.grade;
            count++;
            latest = item.grade;
        });
        switch (this.state.quiz.options['method']){
            case "highest":
                return highest;
            case "lowest":
                return lowest;
            case "average":
                return total/count;
            case "letest":
                return latest;
            default:
                return 0;
        }

    }
    getQuestionMethodGrade = (attempts, index) => {
        let highest = 0;
        let lowest = 0;
        let total = 0;
        let count = 0;
        let latest = 0;
        attempts.forEach(item => {
            if (item.questions[index].grade > highest) {
                highest = item.questions[index].grade;
            }
            if (item.questions[index].grade < lowest) {
                lowest = item.questions[index].grade
            }
            total = total + item.questions[index].grade;
            count++;
            latest = item.questions[index].grade;
        });
        switch (this.state.quiz.options['method']){
            case "highest":
                return highest;
            case "lowest":
                return lowest;
            case "average":
                return total/count;
            case "letest":
                return latest;
            default:
                return 0;
        }

    }
    getSummaryAttempts = () => {
        let data = [
            {
                key:"Min",
                name:"Min",
                grade:Infinity,
                questions:[]
            },{
                key:"Max",
                name:"Max",
                grade:0,
                questions:[]
            },{
                key:"Std Dev",
                name:"Std Dev",
                grade:0,
                s1:0,
                s2:0,
                questions:[]
            }
        ];
        for (let i=0; i<this.state.max_num; i++) {
            data[0].questions.push({grade:Infinity});
            data[1].questions.push({grade:0});
            data[2].questions.push({grade:0, s1:0, s2:0});
        }
        Object.entries(this.state.attempts).forEach(entry => {
            let grade = this.getQuizMethodGrade(entry[1]);
            data[2].s1 = data[2].s1 + grade;
            data[2].s2 = data[2].s2 + grade*grade;
            if (data[0].grade>grade){
                data[0].grade = grade;
            }
            if (data[1].grade<grade) {
                data[1].grade = grade;
            }
            for (let i=0; i<this.state.max_num; i++) {
                let qgrade = this.getQuestionMethodGrade(entry[1], i);
                data[2].questions[i].s1 = data[2].questions[i].s1 + qgrade;
                data[2].questions[i].s2 = data[2].questions[i].s2 + qgrade*qgrade;
                data[0].questions[i].grade = Math.min(data[0].questions[i].grade, qgrade);
                data[1].questions[i].grade = Math.max(data[1].questions[i].grade, qgrade);
            }
        });
        let n = Object.keys(this.state.attempts).length;
        let p1 = data[2].s2 / n;
        let p2 = data[2].s1 / n;
        data[2].grade = Math.sqrt((p1- (p2*p2))*(n/(n-1)));
        for (let i=0; i<this.state.max_num; i++) {
            let p1 = data[2].questions[i].s2 / n;
            let p2 = data[2].questions[i].s1 / n;
            data[2].questions[i].grade = Math.sqrt((p1 - (p2*p2))*(n/(n-1)));
        }
        return data;
    }

    renderFloat = num => {
        if (isNaN(num)) {
            return "---"
        }
        return Math.round((num + Number.EPSILON)*100)/100 + "%";
    }
    render() {
        const expandedRowRender = (user) => {
            let attempts = [];
            let colname = "";
            if (user.key==="Mean") {
                attempts = this.getSummaryAttempts();
                colname = "Statistics";
            } else {
                attempts = this.state.attempts[user.key];
                colname = "Attempt Number";
            }
            const columns = [
                { 
                    key: 'name',
                    title: colname, 
                    dataIndex: 'name',
                    render: attempt=>typeof(attempt.id)==="number"?<Link to={"/Quiz/attempt/"+attempt.id}><Button type={"link"}>Attempt {attempt.key}</Button></Link>:<span>{attempt.key}</span>
                },{
                    key: 'quizgrade',
                    title: user.key==="Mean"?"Final Grade":"Attempt Grade",
                    dataIndex: "quizgrade",
                    render: grade=>this.renderFloat(grade)
                }
            ];
            for (let i=0; i<this.state.max_num; i++) {
                columns.push({
                    key: "Question"+(i+1),
                    title:"Question "+(i+1),
                    dataIndex:"Question"+(i+1),
                    align:"center",
                    render:grade=>this.renderFloat(grade)
                })
            }
        
            const data = [];
            for (let i = 0; i < attempts.length; ++i) {
                let attempt_data = {
                    key: i,
                    name: attempts[i],
                    quizgrade: attempts[i].grade
                }
                for (let j=0; j<this.state.max_num; j++){
                    attempt_data["Question"+(j+1)] = attempts[i].questions[j].grade;
                }
                data.push(attempt_data);
            }
            return <Table columns={columns} dataSource={data}/>;
        };
        const dataSource = []
        const columns = [
            {
                key:"name",
                title:"User's name",
                dataIndex:"name",
                render: user=>(<Link to={"/User/"+user}><Button type={"link"}>{user}</Button></Link>)
            },{
                key:"quizgrade",
                title:(<Tooltip title={"Grade after combining attempt grades according to Quiz's method"}>
                            Final Grade
                        </Tooltip>),
                dataIndex:"quizgrade",
                align:"center",
                render: num => this.renderFloat(num)
            }
        ]
        const mean_data = {
            key:"Mean",
            name:"Mean",
            quizgrade: 0
        }
        for (let i=1; i<=this.state.max_num; i++) {
            columns.push({
                key: "Question"+i,
                title:"Question "+i,
                dataIndex:"Question"+i,
                align:"center",
                render:num=>this.renderFloat(num)
            });
            mean_data["Question"+i] = 0;
        }
        Object.entries(this.state.attempts).forEach(entry => {
            let attempt_data = {
                key: entry[0],
                name: entry[0],
            }
            for (let i=1; i<=this.state.max_num; i++) {
                let grade = this.getQuestionMethodGrade(entry[1], i-1);
                attempt_data["Question"+i] = grade;
                mean_data["Question"+i] = mean_data["Question"+i] + grade;
            }
            let grade = this.getQuizMethodGrade(entry[1])
            attempt_data["quizgrade"] = grade;
            mean_data["quizgrade"] = mean_data["quizgrade"] + grade;
            dataSource.push(attempt_data);
        });
        Object.entries(mean_data).forEach(entry=> {
            if (typeof(entry[1])==="number") {
                mean_data[entry[0]] = entry[1] / Object.keys(this.state.attempts).length;
            }
        });
        dataSource.push(mean_data);
        // console.log(dataSource)
        return (
            <div className={"QuizStats"} style={{padding: "0px 64px 64px 64px"}} >
                {this.state.quiz && <>
                    <Typography.Title level={2}>
                        Gradebook: {this.state.quiz.title}
                    </Typography.Title>
                    <Descriptions
                        title="Quiz Info"
                        //bordered
                        column={{ xxl: 3, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                    >
                        <Descriptions.Item label="Author">{this.state.quiz.author}</Descriptions.Item>
                        <Descriptions.Item label="Status">{this.state.quiz.status}</Descriptions.Item>
                        <Descriptions.Item label="Bonus">{this.state.quiz.bonus}</Descriptions.Item>
                        <Descriptions.Item label="Start">{moment(this.state.quiz.start_end_time[0]).format("llll")}</Descriptions.Item>
                        <Descriptions.Item label="End">{moment(this.state.quiz.start_end_time[1]).format("llll")}</Descriptions.Item>
                        <Descriptions.Item label="Last Modified">{moment(this.state.quiz.last_modified_date).format("llll")}</Descriptions.Item>
                        <Descriptions.Item label="Method">{this.state.quiz.options["method"]}</Descriptions.Item>
                    </Descriptions>
                    <Divider/>
                </>}
                {this.state.attempts && <Table dataSource={dataSource} columns={columns} expandedRowRender={expandedRowRender} pagination={false}></Table>}
            </div>
        )
    }
}
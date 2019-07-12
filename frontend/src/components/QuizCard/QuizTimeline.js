import React from "react";
import { Line } from 'rc-progress';
import {Divider, Popover, Steps, Statistic, Tag, Tooltip, Row, Col} from "antd";
import moment from 'moment';

export default class QuizTimeline extends React.Component {

    displayTimeLeft = () => {
        return (
            <Tooltip title={this.props.endTime?this.props.endTime.format('llll'):undefined}>
                {this.calculateTimeLeft().humanize(true)}
            </Tooltip>
        )
    };

    calculateTimeLeft = () => {
        return moment.duration(moment(this.props.endTime).diff(moment()));
    };

    calculatePercent = () => {
        const durationLeft = this.calculateTimeLeft();
        const durationAll = moment.duration(moment(this.props.endTime).diff(this.props.startTime));
        const proportion = durationLeft.as('milliseconds') / durationAll.as('milliseconds');
        return proportion * 100;
    };

    render() {

        const { Countdown } = Statistic;

        return (
            <div style={{marginTop: 16}}>
                <Line percent={this.props.percent ? this.props.percent: this.calculatePercent()} strokeWidth="3" trailWidth="3" strokeColor="#22DDAA" strokeLinecap="square"/>
                {/*<Countdown prefix={"Time Left: "} value={deadline} valueStyle={{fontSize: 16, display: "inline", }} style={{display: "inline"}}/>*/}
                <Row>
                    <Col span={11}>
                        <span style={{fontSize: 16, color: "black"}}>Due: {this.calculateTimeLeft() ? this.displayTimeLeft() : "unknown"}</span>
                    </Col>
                    <Col span={1}>
                        <Divider type="vertical"/>
                    </Col>
                    <Col span={12}>
                        <span style={{fontSize: 16, color: "black"}}>Status: {this.props.status ? this.props.status: "unknown"}</span>
                    </Col>
                </Row>

            </div>
        )
    }
}
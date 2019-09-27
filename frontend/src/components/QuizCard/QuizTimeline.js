import React from "react";
import { Line } from 'rc-progress';
import {Divider, Tooltip, Row, Col} from "antd";
import moment from 'moment';

/**
 * the time bar for quiz card
 */
export default class QuizTimeline extends React.Component {

    /* display the remaining time */
    displayTimeLeft = () => {
        return (
            <Tooltip title={this.props.endTime?this.props.endTime.format('llll'):undefined}>
                {this.calculateTimeLeft()}
            </Tooltip>
        )
    };

    /* calculate the remaining time */
    calculateTimeLeft = () => {
        return moment(this.props.endTime).fromNow();
    };

    /* calculate the percentage of remaining time*/
    calculatePercent = () => {
        const durationLeft = moment.duration(moment(this.props.endTime).diff(moment()));
        const durationAll = moment.duration(moment(this.props.endTime).diff(this.props.startTime));
        const proportion = durationLeft.as('milliseconds') / durationAll.as('milliseconds');
        return proportion * 100;
    };

    /* color of the bar */
    getColor = () => {
        const percent = this.props.percent ? this.props.percent: this.calculatePercent();
        if (percent >= 100) {
            //return "#14DD00"
        }
        else if (percent >= 50) {
            return "#22DDAA";
        }
        else if (percent >= 25) {
            return "#DDB80A"
        }
        else {
            return "#DD301D"
        }
    };

    render() {

        return (
            <div style={{marginTop: 16}}>
                {!this.props.noLine && <Line percent={this.props.percent ? this.props.percent: this.calculatePercent()} strokeWidth="3" trailWidth="3" strokeColor={this.getColor()} strokeLinecap="square"/>}
                <Row>
                    <Col span={11}>
                        <span style={{fontSize: 16, color: "black"}}>Due: {this.props.endTime ? this.displayTimeLeft() : "unknown"}</span>
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
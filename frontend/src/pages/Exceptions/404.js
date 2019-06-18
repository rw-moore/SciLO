import React from 'react';
import {Alert, Divider} from "antd";

export default class NotFoundException extends React.Component {
    render() {
        return (
            <div>
                <Alert
                    style={{width: "75%", marginLeft: "12.5%"}}
                    message="404 - NOT FOUND"
                    description="The page you requested cannot be found."
                    type="error"
                    showIcon
                />
                <Divider orientation="left">But you can play a game to relax!</Divider>
                <iframe
                    style={{
                        width: "90%",
                        marginLeft: "5%",
                        height: "70vh"
                    }}
                    src="https://www.spider-solitaire-game.com/"
                />
            </div>
        )}
}
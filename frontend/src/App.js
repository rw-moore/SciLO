import React from 'react';
import {Breadcrumb, Button, Divider, Icon, Layout, Menu, Table, Tag} from "antd";
import './App.css';
import SketchQuestionBank from "./layouts/SketchQuestionBank";
import BasicLayout from "./layouts/BasicLayout";

export default class App extends React.Component{
    render() {
        return (
            <SketchQuestionBank/>
        )
    }

}
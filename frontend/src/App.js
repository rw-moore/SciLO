import React from 'react';
import {Breadcrumb, Button, Divider, Icon, Layout, Menu, Table, Tag} from "antd";
import './App.css';
import SketchQuestionBank from "./layouts/SketchQuestionBank";
import QuestionBankTable from "./pages/QuestionBankTable"
import BasicLayout from "./layouts/BasicLayout";
import CreateQuestions from "./pages/CreateQuestions";

export default class App extends React.Component{
    render() {
        return (
            <BasicLayout>
                {/*<QuestionBankTable/>*/}
                <CreateQuestions/>
            </BasicLayout>
        )
    }

}
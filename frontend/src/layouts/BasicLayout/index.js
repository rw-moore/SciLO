
import React, {Children} from "react";
import DocumentTitle from 'react-document-title';
import {BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import {Icon, Layout, Breadcrumb, Row, Col} from "antd";
import "./index.css";
import SideNav from "../SideNav";
import QuestionBankTable from "../../pages/QuestionBankTable";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import CreateQuestions from "../../pages/CreateQuestions";
import UserIcon from "../../components/Users/UserIcon";
import NotFoundException from "../../pages/Exceptions/404";
import CreateQuiz from "../../pages/CreateQuiz";

/**
 * The very basic layout for the entire app
 */
export default class BasicLayout extends React.Component {
    footer = "Project SciLo - Frontend";

    getContext = () => {
        const location = "SciLo";
        const breadcrumbNameList = ["QuestionBank", "Math101"];

        return {
            location,
            breadcrumbNameList,
        };
    };

    render() {
        const {Header, Footer, Content} = Layout;

        // function Question({ match }) {
        //     return <h3>Requested Param: {match.params.id}</h3>;
        // }

        function QuestionBank({ match }) {
            return (
                <div>
                    <Route exact path={`${match.path}/new`} render={() => <CreateQuestions/>} />
                    <Route path={`${match.path}/edit/:id`} render={({match}) => <CreateQuestions id={match.params.id}/>} />
                    <Route
                        exact
                        path={match.path}
                        render={() => <QuestionBankTable url={match.path}/>}
                    />
                </div>
            );
        }

        function Quiz({ match, location }) {
            const query = location.search;
            let questions;
            if (query) {
                const question = query.split("questions=")[1];
                questions = question.split(",");
            }
            return (
                <div>
                    <Route exact path={`${match.path}/new`} render={() => <CreateQuiz question={questions}/>} />
                    <Route path={`${match.path}/edit/:id`} render={({match}) => <CreateQuestions id={match.params.id}/>} />
                    <Route
                        exact
                        path={match.path}
                        render={() => <QuestionBankTable url={match.path}/>}
                    />
                </div>
            )
        }

        const layout = (
            <Layout className="BasicLayout">
                <SideNav/>
                <Layout>
                    <Header className="Header">
                        <Row>
                            <Col span={22}>
                                <Breadcrumb>
                                    <Breadcrumb.Item>
                                        <Link to={`/`}>{<Icon type="home"/>}</Link>
                                    </Breadcrumb.Item>

                                    {this.getContext().breadcrumbNameList.map(item => {
                                            let i = 1;
                                            return (
                                                <Breadcrumb.Item key={i++}>
                                                    {<Link to={`/${item}`}>{item}</Link>}
                                                </Breadcrumb.Item>
                                            )
                                        }
                                    )}
                                </Breadcrumb>
                            </Col>
                            <Col span={2}>
                                <UserIcon style={{float: 'right', position:'relative', top: '-20px'}}/>
                            </Col>
                        </Row>
                    </Header>

                    <Content className="Content">
                        <Switch>
                            <Route path="/" exact component={CreateQuestions} />
                            <Route path="/QuestionBank" component={QuestionBank} />
                            <Route path="/Quiz" component={Quiz} />
                            <Route component={NotFoundException}/>
                        </Switch>
                    </Content>
                    {/*<Route path={'/QuestionBank'} exact render={() => (*/}
                        {/*<Footer className="Footer">*/}
                            {/*{this.footer}*/}
                        {/*</Footer>*/}
                    {/*)} />*/}

                </Layout>
            </Layout>
        );

        return (
            <Router>
                <DocumentTitle title={this.getContext().location}>
                    {layout}
                </DocumentTitle>
            </Router>
        )
    }
}
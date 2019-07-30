
import React, {Children} from "react";
import DocumentTitle from 'react-document-title';
import {BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import {Icon, Layout, Breadcrumb, Row, Col} from "antd";
import {UserProvider, UserConsumer} from "../../contexts/UserContext";
import "./index.css";
import SideNav from "../SideNav";
import QuestionBankTable from "../../pages/QuestionBankTable";
import CreateQuestionForm from "../../components/Forms/CreateQuestionForm";
import CreateQuestions from "../../pages/CreateQuestions";
import UserIcon from "../../components/Users/UserIcon";
import NotFoundException from "../../pages/Exceptions/404";
import CreateQuiz from "../../pages/CreateQuiz";
import QuizList from "../../pages/QuizList";
import LoginForm from "../../components/Forms/LoginForm";
import UserPanel from "../../pages/User/UserPanel";
import Login from "../../components/Users/Login";
import UserProfileForm from "../../components/Forms/RegisterForm";
import UserHeaderControl from "../../components/Users/UserHeaderControl";
import GetInitial from "../../utils/GetInitial";
import UnauthorizedException from "../../pages/Exceptions/401";

/**
 * The very basic layout for the entire app
 */
export default class BasicLayout extends React.Component {
    footer = "Project SciLo - Frontend";

    state = {};

    getContext = () => {
        const location = "SciLo";
        const breadcrumbNameList = ["QuestionBank", "Math101"];

        return {
            location,
            breadcrumbNameList,
        };
    };

    setUser = (user) => {
        this.setState({
            user: user
        })
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
                    <Route exact path={`${match.path}/new`} render={() => <CreateQuiz questions={questions}/>} />
                    <Route path={`${match.path}/edit/:id`} render={({match}) => <CreateQuiz id={match.params.id}/>} />
                    <Route
                        exact
                        path={match.path}
                        render={() => <QuizList url={match.path}/>}
                    />
                </div>
            )
        }

        const User = ({ match }) => {
            return (
                <div>
                    <Route exact path={`${match.path}/register`} render={() => <div style={{padding: "32px 64px 32px 64px"}}><UserProfileForm setUser={this.setUser}/></div>} />
                    <Route
                        exact
                        path={match.path}
                        render={() => <UserConsumer>
                            {User => User ? <UserPanel token={User.token}/> : <UnauthorizedException setUser={this.setUser}/>}
                            </UserConsumer>}
                    />
                </div>
            );
        };

        function TopBreadcrumb({location}) {
            return (
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to={`/`}>{<Icon type="home"/>}</Link>
                    </Breadcrumb.Item>

                    {location.pathname.split("/").map(item => {
                            if (item) {
                                return (
                                    <Breadcrumb.Item key={item}>
                                        {<Link to={`${location.pathname.split(item)[0]}${item}`}>{item}</Link>}
                                    </Breadcrumb.Item>
                                )
                            }
                        }
                    )}
                </Breadcrumb>
            )
        }

        const layout = (
            <Layout className="BasicLayout">
                <UserProvider value={this.state.user}>
                <SideNav/>
                <Layout>
                    <Header className="Header">
                        <Row>
                            <Col span={22}>
                                <Route path="/" component={TopBreadcrumb}/>
                            </Col>
                            <Col span={2}>
                                <UserConsumer>
                                    {
                                        (User) => {
                                            if (User) {
                                                console.log(User);
                                                return <UserHeaderControl style={{float: 'right', position:'relative', top: '-25px'}} user={User.user} signOut={()=>{this.setState({user: undefined})}}/>
                                            }
                                            else {
                                                return <Login style={{float: 'right', position:'relative', top: '-8px'}} setUser={this.setUser}/>
                                            }
                                        }
                                    }
                                </UserConsumer>
                            </Col>
                        </Row>
                    </Header>

                    <Content className="Content">
                        <Switch>
                            <Route path="/" exact component={CreateQuestions} />
                            <Route path="/QuestionBank" component={QuestionBank} />
                            <Route path="/Quiz" component={Quiz} />
                            <Route path="/User" component={User} />
                            <Route component={NotFoundException}/>
                        </Switch>
                    </Content>
                    {/*<Route path={'/QuestionBank'} exact render={() => (*/}
                        {/*<Footer className="Footer">*/}
                            {/*{this.footer}*/}
                        {/*</Footer>*/}
                    {/*)} />*/}

                </Layout>
                </UserProvider>
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
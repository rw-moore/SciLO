import React from "react";
import DocumentTitle from 'react-document-title';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Breadcrumb, Col, Icon, Layout, message, Row} from "antd";
import {UserConsumer, UserProvider} from "../../contexts/UserContext";
import "./index.css";
import SideNav from "../SideNav";
import QuestionBankTable from "../../pages/QuestionBankTable";
import CreateQuestions from "../../pages/CreateQuestions";
import NotFoundException from "../../pages/Exceptions/404";
import CreateQuiz from "../../pages/CreateQuiz";
import QuizList from "../../pages/QuizList";
import UserPanel from "../../pages/User/UserPanel";
import Login from "../../components/Users/Login";
import UserProfileForm from "../../components/Forms/RegisterForm";
import UserHeaderControl from "../../components/Users/UserHeaderControl";
import UnauthorizedException from "../../pages/Exceptions/401";
import ForgetPassword from "../../components/Users/ForgetPassword";
import TakeQuiz from "../../pages/QuizList/TakeQuiz";
import CourseDashboard from "../../pages/Course/CourseDashboard"
import Course from "../../pages/Course"
import TestPage from "../../pages/TestPage";
// import GetUserByUsername from "../../networks/GetUserByUsername";
import GetUserById from "../../networks/GetUserById";

const wordsToExcludeFromBread = ['edit', 'attempt'];

/**
 * The very basic layout for the entire app
 */
export default class BasicLayout extends React.Component {
    footer = "Project SciLo - Frontend";



    constructor(props) {
        super(props);
        const token = window.sessionStorage.getItem("token");
        const user = JSON.parse(window.sessionStorage.getItem("user"));
        if (token && user) {
            this.state = {
                user: {
                    token: token,
                    user: user,
                }
            }
        }
        else {
            window.sessionStorage.clear();
            this.state = {};
        }
    }

    fetch = () => {
        GetUserById(this.state.user.user.id, this.state.user.token).then( data => {
            if (!data || data.status !== 200) {
                message.error(`Cannot fetch user profile, see console for more details.`);
            }
            else {
                this.updateUserInfo(data.data.user)
            }
        });
    };

    componentDidMount() {
        if (this.state.hasOwnProperty("user"))
            this.fetch()
    }

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

    updateUserInfo = (user) => {
        this.setState({
            user: {
                token: this.state.user.token,
                user: {...this.state.user.user, ...user}
            }
        });
        window.sessionStorage.setItem("user", JSON.stringify(this.state.user.user));
        console.log(this.state.user.user);
    };

    signOut = () => {
        this.setState({
            user: null
        });
        window.sessionStorage.clear();
    };

    render() {
        const {Header, Content} = Layout;

        // function Question({ match }) {
        //     return <h3>Requested Param: {match.params.id}</h3>;
        // }

        const QuestionBank = ({ match, location }) => {
            const query = location.search;
            let course;
            if (query) {
                course = query.split("course=")[1];
            }
            return (
                <UserConsumer>
                    { (User) => User ?
                        <div>
                            <Route exact path={`${match.path}/new`} render={() => <CreateQuestions token={User.token} course={course}/>} />
                            <Route path={`${match.path}/edit/:id`} render={({match}) => <CreateQuestions id={match.params.id} token={User.token}/>} />
                            <Route
                                exact
                                path={match.path}
                                render={() => <QuestionBankTable url={match.path} token={User.token} user={User.user.id}/>}
                            />
                        </div>
                        :
                        <UnauthorizedException setUser={this.setUser}/>
                    }
                </UserConsumer>
            );
        };

        const Courses = ({ match }) => {
            return (
                <UserConsumer>
                    { (User) => User ?
                        <div>
                            <Switch>
                                <Route path={`${match.path}/:id`}
                                       render={({match}) => match.params.id ? <Course id={match.params.id} token={User.token}/> : <NotFoundException/>}/>
                                <Route
                                    exact
                                    path={match.path}
                                    render={() => <CourseDashboard url={match.path} token={User.token}/>}
                                />
                            </Switch>
                        </div>
                        :
                        <UnauthorizedException setUser={this.setUser}/>
                    }
                </UserConsumer>
            );
        };


        const Quiz = ({ match, location }) => {
            const query = location.search;
            let questions;
            let course;
            if (query) {
                const question = query.split("questions=")[1];
                if (question) {questions = question.split(",");}
                course = query.split("course=")[1];
            }

            return (
                <UserConsumer>
                    { (User) => User ?
                        <div>
                            <Switch>
                                <Route exact path={`${match.path}/new`} render={() => <CreateQuiz questions={questions} course={course} token={User.token}/>}/>
                                <Route path={`${match.path}/edit/:id`}
                                       render={({match}) => match.params.id ? <CreateQuiz id={match.params.id} token={User.token}/> : <NotFoundException/>}/>
                                <Route path={`${match.path}/attempt/:id`}
                                       render={({match}) => match.params.id ? <TakeQuiz id={match.params.id} token={User.token}/> : <NotFoundException/>}/>
                                <Route
                                    exact
                                    path={match.path}
                                    render={() => <QuizList url={match.path} token={User.token}/>}
                                />
                                <Route component={NotFoundException}/>
                            </Switch>
                        </div>
                        :
                        <UnauthorizedException setUser={this.setUser}/>
                    }
                </UserConsumer>
            )
        };

        const User = ({ match }) => {
            return (
                <div>
                    <Switch>
                        <Route exact path={`${match.path}/forget-password`} render={() => <div style={{padding: "32px 128px 32px 128px"}}><ForgetPassword setUser={this.setUser}/></div>} />
                        <Route exact path={`${match.path}/register`} render={() => <div style={{padding: "32px 64px 32px 64px"}}><UserProfileForm setUser={this.setUser}/></div>} />
                        <Route
                            exact
                            path={match.path}
                            render={() => <UserConsumer>
                                {User => User ? <UserPanel name={User.user.username} token={User.token} updateUserInfo={this.updateUserInfo}/> : <UnauthorizedException setUser={this.setUser}/>}
                                </UserConsumer>}
                        />
                        <Route
                            exact
                            path={`${match.path}/:name`}
                            render={({match}) =>
                                <UserConsumer>
                                   {User => User ? <UserPanel name={match.params.name} token={User.token} updateUserInfo={User.user.username === match.params.name?this.updateUserInfo:undefined}/> : <UnauthorizedException setUser={this.setUser}/>}
                                </UserConsumer>
                            }
                        />
                        <Route component={NotFoundException}/>
                    </Switch>
                </div>
            );
        };

        function TopBreadcrumb({location}) {
            return (
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to={`/`}>{<Icon type="home"/>}</Link>
                    </Breadcrumb.Item>

                    {location.pathname.split("/").filter(item=> item.length > 0).map(item =>
                        <Breadcrumb.Item key={item}>
                            {wordsToExcludeFromBread.includes(item) ? <span>{item}</span> : <Link to={`${location.pathname.split(item)[0]}${item}`}>{item}</Link>}
                        </Breadcrumb.Item>
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
                                                return <UserHeaderControl style={{float: 'right', position:'relative', top: '-25px'}} user={User.user} signOut={this.signOut}/>
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
                            <Route path="/" exact component={NotFoundException} />
                            <Route path="/Course" component={Courses} />
                            <Route path="/QuestionBank" component={QuestionBank} />
                            <Route path="/Quiz" component={Quiz} />
                            <Route path="/User" component={User} />
                            <Route path="/Test" component={()=>(<TestPage/>)}/>
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
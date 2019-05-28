import React, {Suspense} from "react";
import DocumentTitle from 'react-document-title';
import {Button, Icon, Layout, Breadcrumb} from "antd";
import "./index.css";
import SideNav from "../SideNav";

/**
 * The very basic layout for the entire app
 */
export default class BasicLayout extends React.Component {
    footer = "Project SciLo - Frontend";

    getContext() {
        let {location, breadcrumbNameList} = this.props;
        location = "SciLo";
        breadcrumbNameList = ["Question Bank", "Math 101"];

        return {
            location,
            breadcrumbNameList,
        };
    }

    render() {
        const {Header, Footer, Content} = Layout;

        const layout = (
            <Layout className="BasicLayout">
                <SideNav/>
                <Layout style={{marginLeft: 200}}>
                    <Header className="Header">
                        <Breadcrumb>
                            <Breadcrumb.Item href="">
                                <Icon type="home"/>
                            </Breadcrumb.Item>

                            {this.getContext().breadcrumbNameList.map(item => {
                                    let i = 1;
                                    return (
                                        <Breadcrumb.Item key={i++}>
                                            {item}
                                        </Breadcrumb.Item>
                                    )
                                }
                            )}
                        </Breadcrumb>
                    </Header>

                    <Content className="Content">
                        {this.props.children}
                    </Content>
                    <Footer className="Footer">
                        {this.footer}
                    </Footer>
                </Layout>
            </Layout>
        );

        return (
            <React.Fragment>
                <DocumentTitle title={this.getContext().location}>
                    {layout}
                </DocumentTitle>
            </React.Fragment>
        )
    }
}
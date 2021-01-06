import React from 'react'
import {Col, Collapse, Divider, Row, Tag} from "antd";
import theme from '../../config/theme';
import moment from "moment";

const pStyle = {
    fontSize: 16,
    color: theme['@black'],
    lineHeight: '24px',
    display: 'block',
    marginBottom: 16,
};

/* items in the preview */
const DescriptionItem = ({ title, content }) => (
    <div
        style={{
            fontSize: 14,
            lineHeight: '22px',
            marginBottom: 7,
            color: 'rgba(0,0,0,0.65)',
        }}
    >
        <p
            style={{
                marginRight: 8,
                display: 'inline-block',
                color: theme['@primary-color'],
            }}
        >
            {title}:
        </p>
        {content}
    </div>
);

/**
 * A preview drawer for question, embedded into other views
 */
export default class QuickLook extends React.Component {

    state = {
        active: this.props.question.responses.map(r=>r.id.toString()),
        current: this.props.question.id
    };

    /* update info if the target question changes*/
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.current !== this.props.question.id) {
            this.setState({active: this.props.question.responses.map(r=>r.id.toString()),
                current: this.props.question.id})
        }
    }

    /* parse type */
    static getTypeName(response) {
        if (typeof response.type === "string") {
            return JSON.parse(response.type).name
        }
        else
            return response.type.name
    }

    /* render responses of a question */
    renderResponses = () => {
        const Panel = Collapse.Panel;
        return (
            <Collapse
                bordered={false}
                expandIcon={(panel) => (<strong>{panel.type}</strong>)}
                activeKey={this.state.active}
                onChange={(key)=>{this.setState({active: key})}}
                defaultActiveKey={this.state.active}
            >
                {this.props.question.responses.map(response => (
                    <Panel
                        key={response.id.toString()}
                        style={{backgroundColor: theme["@white"], borderRadius: 4}}
                        header={null}
                        type={QuickLook.getTypeName(response)}
                    >
                        <p style={{color: theme["@primary-color"]}}>
                            {response.text}
                        </p>
                        {response.answers.map(answer=> (
                            <Row key={answer.text}>
                                <Col span={18}>
                                    <span>{answer.text}</span>
                                </Col>
                                <Col span={6}>
                                    <DescriptionItem title="Grade" content={answer.grade}/>
                                </Col>
                            </Row>
                        ))}
                    </Panel>
                ))}
            </Collapse>
        );
    };

    render() {
        return (
            <div>
                <p style={{ ...pStyle, marginBottom: 24 }}>Quick Look</p>
                <p style={pStyle}>Info</p>
                <Row>
                    <Col span={12}>
                        <DescriptionItem title="Title" content={this.props.question.title} />{' '}
                    </Col>
                    <Col span={12}>
                        <DescriptionItem title="ID" content={this.props.question.id} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem title="Course" content={this.props.question.course} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem title="Text" content={<p>{this.props.question.text}</p>} />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem
                            title="Tags"
                            content={this.props.question.tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>)}
                        />
                    </Col>
                </Row>
                <Divider />
                <p style={pStyle}>Content</p>
                <Row>
                    <Col span={24}>
                        <DescriptionItem
                            title="Variables"
                            content={<Tag>{this.props.question.variables && this.props.question.variables.value}</Tag>}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <DescriptionItem title="Responses" content={this.renderResponses()} />
                    </Col>
                </Row>

                <Divider />
                <p style={pStyle}>History</p>
                <Row>
                    <Col span={12}>
                        <DescriptionItem title="Author" content={this.props.question.author} />{' '}
                    </Col>
                    <Col span={12}>
                        <DescriptionItem title="Quizzes" content={this.props.question.quizzes.toString()} />
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <DescriptionItem
                            title="Date Created"
                            content={moment.utc(this.props.question.create_date).format('lll')}/>{' '}
                    </Col>
                    <Col span={12}>
                        <DescriptionItem
                            title="Last Modified"
                            content={moment.utc(this.props.question.last_modify_date).format('lll')}/>
                    </Col>
                </Row>
            </div>
        )
    }
}
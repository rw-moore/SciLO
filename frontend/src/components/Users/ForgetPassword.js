import { Alert, Button, Form, Input, message, Steps } from 'antd';
import React from 'react';
import CheckUsername from '../../networks/CheckUsername';
import ResetPassword from '../../networks/ResetPassword';
import ResetPasswordCaptcha from '../../networks/ResetPasswordCaptcha';
import VerifyEmailCaptcha from '../../networks/VerifyEmailCaptcha';

/**
 * forget / reset password page
 */
export default class ForgetPassword extends React.Component {
	state = {
		current: 0,
	};

	/* search if the enter username exists*/
	searchUser = () => {
		const callback = (result) => {
			if (result === 'This username has been used.') {
				this.setState({ current: 1, nameStatus: 'success' });
			} else if (!result) {
				message.error('This user does not exist.');
				this.setState({ nameStatus: 'error' });
			} else {
				message.error(result);
				this.setState({ nameStatus: 'warning' });
			}
		};

		if (this.state.username) {
			CheckUsername(this.state.username, callback);
		}
	};

	/* request the server to send captcha through email */
	sendEmailCaptcha = () => {
		this.setState({ loadingEmailCaptcha: true });
		ResetPasswordCaptcha(this.state.username).then((data) => {
			if (!data || data.status !== 200) {
				if (data.status > 400) {
					message.error(
						`Cannot send verification captcha, see browser console for more details.`
					);
					this.setState({
						captchaStatus: 'warning',
						loadingEmailCaptcha: false,
					});
				} else {
					message.error(data.data.message);
					this.setState({
						captchaStatus: 'error',
						loadingEmailCaptcha: false,
					});
				}
			} else {
				this.setState({
					sentEmail: true,
					loadingEmailCaptcha: false,
					captchaStatus: 'success',
				});
				setTimeout(() => {
					this.setState({ sentEmail: false });
				}, 60000);
			}
		});
	};

	/* verify the enter captcha */
	verifiedEmail = () => {
		this.setState({ loadingEmailCaptcha: true });
		const info = {
			code: this.state.emailCaptcha,
			username: this.state.username,
		};
		VerifyEmailCaptcha(info).then((data) => {
			if (!data || data.status !== 200) {
				if (data.status > 400) {
					message.error(
						`Cannot send captcha, see browser console for more details.`
					);
					this.setState({ captchaStatus: 'warning' });
				} else {
					message.error(data.data.message);
					this.setState({ captchaStatus: 'error' });
				}
				this.setState({
					loadingEmailCaptcha: false,
				});
			} else {
				this.setState({
					emailCaptcha: null,
					sentEmail: false,
					loadingEmailCaptcha: false,
					captchaStatus: 'success',
					token: data.data.token,
					current: 2,
				});
				message.success('Captcha verified!');
			}
		});
	};

	/* reset to given the password */
	changePassword = () => {
		if (this.state.token) {
			const info = {
				password: this.state.password,
			};

			ResetPassword(this.state.username, info, this.state.token).then(
				(data) => {
					if (!data || data.status !== 200) {
						if (data.status > 400) {
							message.error(
								`Cannot reset password, see browser console for more details.`
							);
							this.setState({
								pwdStatus: 'warning',
								loadingEmailCaptcha: false,
							});
						} else {
							message.error(data.data.password.join(' '));
							this.setState({
								pwdStatus: 'error',
								pwdError: data.data.password.join(' '),
								loadingEmailCaptcha: false,
							});
						}
					} else {
						this.setState({ current: 3 });
						setTimeout(() => {
							window.location.replace('/User');
						}, 5000);
					}
				}
			);
		}
	};

	render() {
		const { current } = this.state;
		const { Step } = Steps;

		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 },
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 8 },
			},
		};

		const steps = [
			{
				title: 'Username',
				content: (
					<div>
						<Form.Item
							label={'User name'}
							{...formItemLayout}
							required
							validateStatus={this.state.nameStatus}
						>
							<Input.Search
								placeholder={
									'Enter your username to continue...'
								}
								value={this.state.username}
								onChange={(e) => {
									this.setState({
										username: e.target.value,
										nameStatus: undefined,
									});
								}}
								onSearch={this.searchUser}
							/>
						</Form.Item>
					</div>
				),
			},
			{
				title: 'Verify',
				content: (
					<div>
						<Form.Item
							label="Captcha"
							{...formItemLayout}
							validateStatus={this.state.captchaStatus}
							required
						>
							<Input.Search
								value={this.state.emailCaptcha}
								enterButton={
									<Button
										disabled={
											this.state.sentEmail &&
											!this.state.emailCaptcha
										}
										loading={this.state.loadingEmailCaptcha}
									>
										{this.state.sentEmail ||
										this.state.emailCaptcha
											? 'Verify'
											: 'Get captcha'}
									</Button>
								}
								onChange={(e) => {
									this.setState({
										emailCaptcha: e.target.value,
										captchaStatus: undefined,
									});
								}}
								onSearch={() => {
									if (this.state.emailCaptcha) {
										this.verifiedEmail();
									} else {
										this.sendEmailCaptcha();
									}
								}}
							/>
						</Form.Item>
					</div>
				),
			},
			{
				title: 'Password',
				content: (
					<div>
						<Form.Item
							label={'New password'}
							{...formItemLayout}
							required
							validateStatus={this.state.pwdStatus}
							extra={
								<span style={{ color: 'red' }}>
									{this.state.pwdError}
								</span>
							}
						>
							<Input.Password
								value={this.state.password}
								onChange={(e) => {
									this.setState({
										password: e.target.value,
										pwdStatus: undefined,
										pwdError: undefined,
									});
								}}
							/>
							<br />
							<br />
							<Button
								type={'primary'}
								onClick={this.changePassword}
							>
								Complete
							</Button>
						</Form.Item>
					</div>
				),
			},
			{
				title: 'Done',
				content: (
					<Alert
						style={{ margin: '0px 128px 32px 128px' }}
						message="Your password has been reset"
						description={
							<span>
								You will be redirected in 5 seconds or{' '}
								<a href={'/User'}>click here</a>.
							</span>
						}
						type="success"
						showIcon
					/>
				),
			},
		];

		return (
			<div>
				<Steps current={current}>
					{steps.map((item) => (
						<Step key={item.title} title={item.title} />
					))}
				</Steps>
				<br />
				<br />
				<div
					style={{
						marginTop: 16,
						border: '1px dashed #e9e9e9',
						borderRadius: 6,
						backgroundColor: '#fafafa',
						minHeight: 200,
						textAlign: 'center',
						paddingTop: 80,
					}}
				>
					{steps[current].content}
				</div>
				<br />
				<br />
				<p>
					Notice: You can reset your password only if you have
					verified your email.
				</p>
			</div>
		);
	}
}

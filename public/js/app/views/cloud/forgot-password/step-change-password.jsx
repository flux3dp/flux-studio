define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud',
    'app/actions/alert-actions',
], function(
    React,
    i18n,
    CloudApi,
    AlertActions
) {
    const LANG = i18n.lang.settings.flux_cloud;

    const Controls = ({label, children, errorMessage}) => {
        const labelField = label ? <div className="label">{label}</div> : '';
        const errorField = errorMessage ? <div className="error">{errorMessage}</div> : '';
        return (
            <div className="controls">
                {labelField}
                <div className="control">{children}</div>
                {errorField}
            </div>
        );
    };

    return class StepChangePassword extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                // input field
                verificationCode: '',
                password: '',
                rePassword: '',

                // error message
                showVerificationCodeMissingError: false,
                showPasswordMissingError: false,
                showRePasswordUnmatchError: false,

                //
                isProcessing: false,
            };
        }
        handleInputChange(field, value) {
            this.setState({
                [field]: value
            });
        }

        checkValidation() {
            const isVerificationCodeMissing = () => this.state.verificationCode === '';
            const isPasswordMissing = () => this.state.password === '';
            const isRePasswordUnmatch = () => this.state.password !== this.state.rePassword;

            this.setState({
                showVerificationCodeMissingError: isVerificationCodeMissing(),
                showPasswordMissingError: isPasswordMissing(),
                showRePasswordUnmatchError: isRePasswordUnmatch(),
            });

            return (
                !isVerificationCodeMissing() &&
                !isPasswordMissing() &&
                !isRePasswordUnmatch()
            );
        }

        async handleSignUpClick() {

        }

        handleBack() {
            location.hash = '#studio/cloud/sign-in';
        }

        handleNextClick() {
            if(this.checkValidation()) {
                this.setState({ isProcessing: true });
                AlertActions.showPopupInfo('success');
                location.hash = '#studio/cloud/sign-in';
                // const response = await CloudApi.signUp(fullName, email, password);
                // if(response.ok) {
                //     this.setState({ processing: false });
                //     alert(LANG.check_email);
                // } else {
                //     const error = await response.json();
                //     this.setState({
                //         processing: false,
                //         emailError: true,
                //         emailErrorMessage: LANG[error.message.toLowerCase()]
                //     });
                // }
            }

        }

        render() {
            return (
                <div className="cloud">
                    <div className="container forgot-password">
                        <br/>
                        <div className='middle row'>
                            <div>
                                <Controls label={'驗證碼'} errorMessage={this.state.showVerificationCodeMissingError ? '請輸入驗證碼' : ' '}>
                                    <input
                                        type='text'
                                        value={this.state.verificationCode}
                                        onChange={e => this.handleInputChange('verificationCode', e.target.value)}
                                        onBlur={e => this.handleInputChange('verificationCode', e.target.value)}
                                        placeholder={'驗證碼'}
                                        style={{width: '150px'}}
                                    />
                                </Controls>
                            </div>
                            <br/>
                            <br/>
                            <div>
                                <Controls label={'新密碼'} errorMessage={this.state.showPasswordMissingError ? '請輸入新密碼' : ' '}>
                                    <input
                                        type='password'
                                        value={this.state.password}
                                        onChange={e => this.handleInputChange('password', e.target.value)}
                                        onBlur={e => this.handleInputChange('password', e.target.value)}
                                        placeholder={'新密碼'}
                                    />
                                </Controls>
                            </div>
                            <br/>
                            <div>
                                <Controls label={'新密碼確認'} errorMessage={this.state.showRePasswordUnmatchError ? '密碼不符' : ' '}>
                                    <input
                                        type='password'
                                        value={this.state.rePassword}
                                        onChange={e => this.handleInputChange('rePassword', e.target.value)}
                                        onBlur={e => this.handleInputChange('rePassword', e.target.value)}
                                        placeholder={'新密碼確認'}
                                    />
                                </Controls>
                            </div>
                        </div>
                    </div>

                    <div className="processing">
                        <label>{this.state.isProcessing ? LANG.processing : ''}</label>
                    </div>

                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => this.handleBack()}>{LANG.back}</button>
                            <button className="btn btn-default" onClick={() => this.handleNextClick()}>重設密碼</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});

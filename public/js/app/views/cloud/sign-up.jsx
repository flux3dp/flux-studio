define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud',
], function(
    React,
    i18n,
    CloudApi
) {
    const LANG = i18n.lang.settings.flux_cloud;
    const Controls = ({id, value, label, errorOn, errorMessage, type, onChange, onBlur}) => {
        return (
            <div className="controls">
                <div className="label">{label}</div>
                <div className="control">
                    <input
                        type={type || 'text'}
                        onChange={e => {
                            onChange(id, e.target.value);
                        }}
                        onBlur={e => {
                            // somehow pressing delete key in my mac did delete input field but not trigger onChange event. So wierd..
                            onChange(id, e.target.value);
                            onBlur(id);
                        }}
                        value={value} />
                </div>
                <div className="error">
                    {errorOn ? errorMessage : ' '}
                </div>
            </div>
        );
    };

    return React.createClass({
        getInitialState: function() {
            return {
                nickname: '',
                email: '',
                password: '',
                rePassword: '',
                agreeToTerms: false,
                userNameError: false,
                emailError: false,
                agreeToTermError: false,
                passwordMismatch: false
            };
        },

        _handleControlChange: function(id, val) {
            this.setState({
                [id]: val
            });
        },

        _checkValue: function(id) {
            switch (id) {
                case 'nickname':
                    this.setState({ userNameError: this.state.nickname === '' });
                    break;
                case 'email':
                    if(this.state.email === '') {
                        this.setState({
                            emailError: true,
                            emailErrorMessage: LANG.error_blank_email
                        });
                        break;
                    }
                    let emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                    if(!emailRegex.test(this.state.email)) {
                        this.setState({
                            emailError: true,
                            emailErrorMessage: LANG.error_email_format
                        });
                        break;
                    }
                    this.setState({
                        emailError: false,
                        emailErrorMessage: ''
                    });
                    break;
                case 'password':
                case 'rePassword':
                    if(this.state.password !== '' || this.state.rePassword !== '') {
                        let mismatch = this.state.password !== this.state.rePassword;
                        this.setState({ passwordMismatch: mismatch});
                    }
                    break;
            }
        },

        _allValid: function() {
            const { userNameError, emailError, passwordMismatch, password, agreeToTerms } = this.state;
            this.setState({
                agreeToTermError: !agreeToTerms
            });
    		return (
                !userNameError &&
                !emailError &&
                !passwordMismatch &&
                password !== '' &&
    			agreeToTerms === true
    		);
        },

        _handleAgreementChange: function(e) {
            this.setState({agreeToTerms: e.target.checked});
        },

        _handleSignUp: async function() {
            if(this._allValid()) {
                this.setState({ processing: true });
                let { nickname, email, password } = this.state;

                const response = await CloudApi.signUp(nickname, email, password);
                if(response.ok) {
                    this.setState({ processing: false });
                    alert(LANG.check_email);
                    location.hash = '#studio/cloud/sign-in';
                } else {
                    const error = await response.json();
                    this.setState({
                        processing: false,
                        emailError: true,
                        emailErrorMessage: LANG[error.message.toLowerCase()]
                    });
                }
            }
        },

        _handleCancel: function() {
            location.hash = '#studio/cloud/sign-in';
        },

        render: function() {
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{LANG.sign_up}</h3>
                            <h2>{LANG.flux_cloud}</h2>
                        </div>
                        <div className="row">
                            <Controls
                                id="nickname"
                                label={LANG.nickname}
                                errorMessage={LANG.error_blank_username}
                                errorOn={this.state.userNameError}
                                value={this.state.nickname}
                                onChange={this._handleControlChange}
                                onBlur={this._checkValue} />
                            <Controls
                                id="email"
                                label={LANG.email}
                                errorMessage={this.state.emailErrorMessage}
                                errorOn={this.state.emailError}
                                value={this.state.email}
                                onChange={this._handleControlChange}
                                onBlur={this._checkValue} />
                        </div>
                        <div className="row">
                            <Controls
                                id="password"
                                type="password"
                                label={LANG.password}
                                value={this.state.password}
                                onChange={this._handleControlChange}
                                onBlur={this._checkValue} />
                            <Controls
                                id="rePassword"
                                type="password"
                                label={LANG.re_enter_password}
                                errorMessage={LANG.error_password_not_match}
                                errorOn={this.state.passwordMismatch}
                                value={this.state.rePassword}
                                onChange={this._handleControlChange}
                                onBlur={this._checkValue} />
                        </div>
                        <div className="controls">
                            <div className="control">
                                <input
                                    id="agreeToTerms"
                                    className="pointer"
                                    type="checkbox"
                                    checked={this.state.agreeToTerms}
                                    onChange={this._handleAgreementChange} />
                                <label dangerouslySetInnerHTML={{ __html: LANG.agreement }} />
                            </div>
                        </div>
                        <div className="processing-error">
                            <label>{this.state.agreeToTermError ? LANG.agree_to_terms : ''}</label><br/>
                        </div>
                    </div>
                    <div className="processing">
                        <label>{this.state.processing ? LANG.processing : ''}</label>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleCancel}>{LANG.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleSignUp}>{LANG.sign_up}</button>
                        </div>
                    </div>
                </div>
            );
        }
    });
});

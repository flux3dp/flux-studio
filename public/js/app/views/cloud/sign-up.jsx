define([
    'jquery',
    'react',
    'helpers/sprintf',
    'helpers/api/cloud',
], function(
    $,
    React,
    Sprintf,
    CloudApi
) {
    'use strict';

    let Controls = React.createClass({
        _handleEntered: function(e) {
            this.props.onEntered(this.props.id, e.target.value);
        },
        render: function() {
            let {label, errorMessage, errorOn, type} = this.props;
            return (
                <div className="controls">
                    <div className="label">{label}</div>
                    <div className="control">
                        <input type={type || 'text'} onBlur={this._handleEntered.bind(this)} />
                    </div>
                    <div className="error">
                        {errorOn ? errorMessage : ' '}
                    </div>
                </div>
            );
        }
    });

    return React.createClass({

        values: {
            password: '',
            rePassword: '',
            email: ''
        },

        getInitialState: function() {
            return {
                userNameError: false,
                emailError: false,
                passwordMismatch: false
            }
        },

        _checkValue: function(id, value) {
            let lang = this.props.lang.settings.flux_cloud,
                f = {};

            f['nickname'] = () => {
                this.values['nickname'] = value;
                this.setState({ userNameError: value === '' });
            };

            f['email'] = () => {
                this.values['email'] = value;
                let emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                let emailFormatError = !emailRegex.test(value);
                let message = '';
                // this.setState({ emailFormatError: lang.error_email_used });
                if(value === '') {
                    message = lang.error_blank_email;
                }
                else if(emailFormatError) {
                    message = lang.error_email_format;
                }

                this.setState({
                    emailError: message !== '',
                    emailErrorMessage: message
                });
            };

            f['password'] = () => {
                this.values['password'] = value;
            };

            f['rePassword'] = () => {
                this.values['rePassword'] = value;
            };

            f['agreeToTerms'] = () => {
                this.values[id] = value
            }

            if(typeof f[id] !== 'undefined') {
                f[id]();
            };

            if(this.values.password !== '' && this.values.rePassword !== '') {
                let mismatch = this.values.password !== this.values.rePassword
                this.setState({ passwordMismatch: mismatch});
            }
        },

        _allValid: function() {
            console.log(this.values, this.state);
            let { nickname, email, password, rePassword, agreeToTerms } = this.values,
                { emailError } = this.state,
                lang = this.props.lang.settings.flux_cloud;

            this.setState({ errorMessage: agreeToTerms ? '' : lang.agree_to_terms });

    		return (
    			nickname !== '' &&
    			email !== '' &&
    			emailError === false &&
    			password !== '' &&
    			password === rePassword &&
    			agreeToTerms === true
    		);
        },

        _handleAgreementChange: function(e) {
            this._checkValue(e.target.id, e.target.checked);
        },

        _handleSignUp: function() {
            if(this._allValid()) {
                this.setState({ processing: true });
                let { nickname, email, password } = this.values;
                let lang = this.props.lang.settings.flux_cloud;

                CloudApi.signUp(nickname, email, password).then(response => {
                    if(response.ok) {
                        this.setState({ processing: false });
                        alert(lang.check_email);
                        location.hash = '#studio/cloud/sign-in';
                    }
                    else {
                        response.json().then(error => {
                            this.setState({
                                processing: false,
                                emailError: true,
                                emailErrorMessage: lang[error.message.toLowerCase()]
                            });
                            console.log(error.message);
                        });
                    }
                });
            }
            // location.hash = '#studio/cloud/sign-up-success';
        },

        _handleCancel: function() {
            location.hash = '#studio/cloud/sign-in';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud,
                message = '';

            if(this.state.processing) {
                message = lang.processing;
            }
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.sign_up}</h3>
                            <h2>{lang.flux_cloud}</h2>
                        </div>
                        <div className="row">
                            <Controls
                                id="nickname"
                                label={lang.nickname}
                                errorMessage={lang.error_blank_username}
                                errorOn={this.state.userNameError}
                                onEntered={this._checkValue}
                            />
                            <Controls
                                id="email"
                                label={lang.email}
                                errorMessage={this.state.emailErrorMessage}
                                errorOn={this.state.emailError}
                                onEntered={this._checkValue}
                            />
                        </div>
                        <div className="row">
                            <Controls
                                id="password"
                                type="password"
                                label={lang.password}
                                onEntered={this._checkValue} />
                            <Controls
                                id="rePassword"
                                type="password"
                                label={lang.re_enter_password}
                                errorMessage={lang.error_password_not_match}
                                errorOn={this.state.passwordMismatch}
                                onEntered={this._checkValue}
                            />
                        </div>
                        <div className="controls">
                            <div className="control">
                                <input id="agreeToTerms" className="pointer" type="checkbox" onChange={this._handleAgreementChange} />
                                <label dangerouslySetInnerHTML={{ __html: lang.agreement }}></label>
                            </div>
                        </div>
                        <div className="processing-error">
                            <label>{this.state.errorMessage}</label><br/>
                        </div>
                    </div>
                    <div className="processing">
                        <label>{message}</label>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleSignUp}>{lang.sign_up}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});

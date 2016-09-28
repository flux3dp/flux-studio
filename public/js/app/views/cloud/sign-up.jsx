define([
    'jquery',
    'react',
    'helpers/sprintf',
], function(
    $,
    React,
    Sprintf
) {
    'use strict';

    let Controls = React.createClass({
        _handleEntered: function(e) {
            this.props.onEntered(this.props.id, e.target.value);
        },
        render: function() {
            let {label, errorMessage, errorOn} = this.props;
            return (
                <div className="controls">
                    <div className="label">{label}</div>
                    <div className="control">
                        <input type="text" onBlur={this._handleEntered.bind(this)} />
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
            userName: '',
            password: '',
            confirmPassword: '',
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
            let f = {};

            f['userName'] = () => {
                this.values['userName'] = value;
            };

            f['email'] = () => {
                this.values['email'] = value;
            };

            f['password'] = () => {
                this.values['password'] = value;
            };

            f['confirmPassword'] = () => {
                this.values['confirmPassword'] = value;
            };

            if(typeof f[id] !== 'undefined') {
                f[id]();
            };

            if(this.values.password !== '' && this.values.confirmPassword !== '') {
                let mismatch = this.values.password !== this.values.confirmPassword
                this.setState({ passwordMismatch: mismatch});
            }

            this.setState({ userNameError: this.values.userName === '' });
            
        },

        _handleSignUp: function() {
            location.hash = '#studio/cloud/sign-up-success';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.sign_up}</h3>
                            <h2>{lang.flux_cloud}</h2>
                        </div>
                        <div className="row">
                            <Controls
                                id="userName"
                                label={lang.username}
                                errorMessage={lang.error_blank_username}
                                errorOn={this.state.userNameError}
                                onEntered={this._checkValue}
                            />
                            <Controls id="password" label={lang.password} onEntered={this._checkValue} />
                        </div>
                        <div className="row">
                            <Controls
                                id="email"
                                label={lang.email}
                                errorMessage={lang.error_email_used}
                                errorOn={this.state.emailError}
                                onEntered={this._checkValue}
                            />
                            <Controls
                                id="confirmPassword"
                                label={lang.re_enter_password}
                                errorMessage={lang.error_password_not_match}
                                errorOn={this.state.passwordMismatch}
                                onEntered={this._checkValue}
                            />
                        </div>
                        <div className="controls">
                            <div className="control">
                                <input className="pointer" id="agreement" type="checkbox" />
                                <label className="pointer" htmlFor="agreement"> {lang.agreement}</label>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel">{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleSignUp}>{lang.sign_up}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});

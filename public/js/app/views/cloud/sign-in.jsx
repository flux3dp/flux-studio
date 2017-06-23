define([
    'jquery',
    'react',
    'helpers/sprintf',
    'helpers/api/cloud',
    'plugins/classnames/index',
    'jsx!app/widgets/Wait-Wording',
    'helpers/nwjs/menu-factory',
], function(
    $,
    React,
    Sprintf,
    CloudApi,
    ClassNames,
    WaitWording,
    menuFactory
) {
    'use strict';

    return React.createClass({

        getInitialState: function() {
            return {
                email: '',
                password: '',
                processing: false,
                showResendVerificationEmail: false
            };
        },

        componentDidMount: function() {
            CloudApi.getMe().then(response => {
                if(response.ok) {
                    return response.json();
                }
            }).then(response => {
                if(response) {
                    location.hash = '#/studio/cloud/bind-machine';
                }
            });
        },

        _handleForgotPassword: function() {
            location.hash = '#/studio/cloud/forgot-password';
        },

        _handleEditValue: function(e) {
            let { id, value } = e.target;
            this.setState({
                [id]: value
            });
        },

        _handleDetectEnterKey: function(e) {
            if(e.key === 'Enter') {
                this._handleSignIn(e);
            }
        },

        _handleCancel: function() {
            location.hash = '#/studio/print';
        },

        _handleResendVerificationEmail: function() {
            let { email } = this.state;
            let lang = this.props.lang.settings.flux_cloud;

            CloudApi.resendVerification(email).then(response => {
                if(response.ok) {
                    location.hash = '#studio/cloud/email-sent';
                }
                else {
                    alert(lang.contact_us);
                }
            });
        },

        _handleSignIn: function(e) {
            e.preventDefault();
            let { email, password } = this.state;
            let lang = this.props.lang.settings.flux_cloud;

            this.setState({
                errorMessage: '',
                processing: true
            });

            CloudApi.signIn(email, password).then((response) => {
                if(response.ok) {
                    response.json().then(r => {
                        let { nickname, email } = r;
                        let displayName = nickname || email;
                        menuFactory.methods.updateAccountDisplay(displayName);
                        location.hash = '#/studio/cloud/bind-machine';
                    });

                }
                else {
                    if (response.status !== 200) {
                        this.setState({
                            errorMessage: lang["SERVER_INTERNAL_ERROR"] || "SERVER_INTERNAL_ERROR",
                            processing: false
                        });
                        return;
                    }
                    response.json().then(error => {
                        this.setState({
                            showResendVerificationEmail: error.message === 'NOT_VERIFIED',
                            errorMessage: lang[error.message.toLowerCase()],
                            processing: false
                        });
                    });
                }
            });
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud,
                verificationClass = ClassNames('resend', {hide: !this.state.showResendVerificationEmail }),
                message = '';

            if(this.state.processing) {
                message = lang.processing;
            }

            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.sign_in}</h3>
                            <h2>{lang.flux_cloud}</h2>
                        </div>
                        <div className="controls">
                            <div>
                                <input id="email" type="text" placeholder="Email" onChange={this._handleEditValue} />
                            </div>
                            <div>
                                <input id="password" type="password" placeholder="Password" onChange={this._handleEditValue} onKeyPress={this._handleDetectEnterKey} />
                            </div>
                            <div className="forget-password">
                                <a href="#/studio/cloud/forgot-password">{lang.forgot_password}</a>
                            </div>
                            <div className="sign-up-description" dangerouslySetInnerHTML={
                                {__html: Sprintf(lang.sign_up_statement, "#/studio/cloud/sign-up")}
                            }>
                            </div>
                        </div>
                        <div className="processing-error">
                            <label>{this.state.errorMessage}</label><br/>
                            <a className={verificationClass} onClick={this._handleResendVerificationEmail}>{lang.resend_verification}</a>
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
                            <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.back}</button>
                            <button className="btn btn-default" onClick={this._handleSignIn}>{lang.sign_in}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});

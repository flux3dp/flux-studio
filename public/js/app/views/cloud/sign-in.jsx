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

    return React.createClass({

        _handleForgotPassword: function() {
            location.hash = '#/studio/cloud/forgot-password';
        },

        _handleCancel: function() {
            location.hash = '#/studio/print';
        },

        _handleSignIn: function() {
            location.hash = '#/studio/cloud/bind-machine';
        },

        render: function() {
            let lang = this.props.lang.settings.flux_cloud;
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{lang.select_to_bind}</h3>
                        </div>
                        <div className="controls">
                            <div>
                                <input type="text" placeholder="Email" />
                            </div>
                            <div>
                                <input type="text" placeholder="Password" />
                            </div>
                            <div className="forget-password">
                                <a href="#/studio/cloud/forgot-password">{lang.forgot_password}</a>
                            </div>
                            <div className="sign-up-description" dangerouslySetInnerHTML={
                                {__html: Sprintf(lang.sign_up_statement, "#/studio/cloud/sign-up")}
                            }>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleCancel}>{lang.cancel}</button>
                            <button className="btn btn-default" onClick={this._handleSignIn}>{lang.sign_in}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});

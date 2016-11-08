define([
    'jquery',
    'react',
    'jsx!views/cloud/sign-in',
    'jsx!views/cloud/sign-up',
    'jsx!views/cloud/sign-up-success',
    'jsx!views/cloud/sign-up-fail',
    'jsx!views/cloud/forgot-password',
    'jsx!views/cloud/email-sent',
    'jsx!views/cloud/bind-machine',
    'jsx!views/cloud/bind-success',
    'jsx!views/cloud/bind-fail',
    'jsx!views/cloud/sign-out',
    'jsx!views/cloud/change-password',
], function(
    $,
    React,
    SignIn,
    SignUp,
    SignUpSuccess,
    SignUpFail,
    ForgotPassword,
    EmailSent,
    BindMachine,
    BindSuccess,
    BindFail,
    SignOut,
    ChangePassword
) {
    'use strict';

    return function(args) {
        args = args || {};

        var HomeView;

        HomeView = React.createClass({

            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            },

            _renderContent: function() {
                var content = {},
                    view = args.child;

                content['sign-in'] = () => <SignIn lang={this.state.lang} />
                content['sign-up'] = () => <SignUp lang={this.state.lang} />
                content['sign-up-success'] = () => <SignUpSuccess lang={this.state.lang} />
                content['sign-up-fail'] = () => <SignUpFail lang={this.state.lang} />
                content['forgot-password'] = () => <ForgotPassword lang={this.state.lang} />
                content['email-sent'] = () => <EmailSent lang={this.state.lang} />
                content['bind-machine'] = () => <BindMachine lang={this.state.lang} />
                content['bind-success'] = () => <BindSuccess lang={this.state.lang} />
                content['bind-fail'] = () => <BindFail lang={this.state.lang} />
                content['change-password'] = () => <ChangePassword lang={this.state.lang} />
                content['sign-out'] = () => <SignOut />


                if(typeof content[view] === 'undefined') { view = 'sign-in'; }
                return content[view]();
            },

            render: function() {
                return (
                    <div className="studio-container settings-cloud">
                        <div className="cloud">
                            {this._renderContent()}
                        </div>
                    </div>
                );
            }

        });

        return HomeView;
    };
});

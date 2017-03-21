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
    'jsx!views/cloud/bind-error',
    'jsx!views/cloud/sign-out',
    'jsx!views/cloud/change-password',
    'jsx!views/cloud/terms',
    'jsx!views/cloud/privacy',
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
    BindError,
    SignOut,
    ChangePassword,
    Terms,
    Privacy
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

            componentWillUpdate: function(nextProps, nextState) {
                console.log('test next props', nextProps, nextState, this.props, this.state);
            },

            logError: function(errorArray) {
                this.setState({
                    error: errorArray,
                    view: 'bind-fail'
                });
            },

            clear: function() {
                this.setState({ view: '' });
            },

            renderContent: function() {
                var content = {},
                    view = this.state.view || args.child;

                content['sign-in']          = () => <SignIn lang={this.state.lang} />;
                content['sign-up']          = () => <SignUp lang={this.state.lang} />;
                content['sign-up-success']  = () => <SignUpSuccess lang={this.state.lang} />;
                content['sign-up-fail']     = () => <SignUpFail lang={this.state.lang} />;
                content['forgot-password']  = () => <ForgotPassword lang={this.state.lang} />;
                content['email-sent']       = () => <EmailSent lang={this.state.lang} />;
                content['bind-machine']     = () => <BindMachine lang={this.state.lang} onError={this.logError} />;
                content['bind-success']     = () => <BindSuccess lang={this.state.lang} />;
                content['bind-fail']        = () => <BindFail lang={this.state.lang} error={this.state.error} clear={this.clear} />;
                content['bind-error']       = () => <BindError lang={this.state.lang} />;
                content['change-password']  = () => <ChangePassword lang={this.state.lang} />;
                content['sign-out']         = () => <SignOut />;
                content['terms']            = () => <Terms lang={this.state.lang} />;
                content['privacy']          = () => <Privacy lang={this.state.lang} />;

                if(typeof content[view] === 'undefined') { view = 'sign-in'; }
                return content[view]();
            },

            render: function() {
                return (
                    <div className="studio-container settings-cloud">
                        <div className="cloud">
                            {this.renderContent()}
                        </div>
                    </div>
                );
            }

        });

        return HomeView;
    };
});

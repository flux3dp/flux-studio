define([
    'react',
    'helpers/i18n',
    'jsx!views/cloud/sign-in',
    'jsx!views/cloud/sign-up',
    'jsx!views/cloud/forgot-password/forgot-password',
    'jsx!views/cloud/bind-machine',
    'jsx!views/cloud/change-password',
    'jsx!views/cloud/my-account',
    'jsx!views/cloud/terms',
    'jsx!views/cloud/privacy',
], function(
    React,
    i18n,
    SignIn,
    SignUp,
    ForgotPassword,
    BindMachine,
    ChangePassword,
    MyAccount,
    Terms,
    Privacy
) {
    return function({child}) {
        return React.createClass({
            getInitialState: function() {
                return {
                };
            },

            componentWillUpdate: function(nextProps, nextState) {
                console.log('test next props', nextProps, nextState, this.props, this.state);
            },

            clear: function() {
                this.setState({ view: '' });
            },

            renderContent: function() {
                const content = {};
                let view = this.state.view || child;

                content['sign-in']          = () => <SignIn />;
                content['sign-up']          = () => <SignUp />;
                content['forgot-password']  = () => <ForgotPassword />;
                content['bind-machine']     = () => <BindMachine lang={i18n.lang} />;
                content['change-password']  = () => <ChangePassword lang={i18n.lang} />;
                content['my-account']       = () => <MyAccount />;
                content['terms']            = () => <Terms />;
                content['privacy']          = () => <Privacy />;

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
    };
});

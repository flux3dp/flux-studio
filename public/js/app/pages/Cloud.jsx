define([
    'jquery',
    'react',
    'jsx!views/cloud/sign-in'
], function(
    $,
    React,
    SignIn
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

                content['sign-in'] = () => {
                    return (
                        <SignIn />
                    );
                }

                content['sign-up'] = () => {
                    return (
                        <div>sign up</div>
                    )
                }

                console.log(view);
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

define([
    'jquery',
    'react',
    'helpers/local-storage',
    'css!cssHome/pages/wifi'
], function($, React, localStorage, actions) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            componentDidMount: function() {
            },
            _handleSetPassword: function(e) {
                e.preventDefault();
                var password = this.refs.password.getDOMNode().value;

                // TODO: go to success or failure page
                // TODO: remove fake process
                var Dt = new Date();

                if (0 === Dt.getMilliseconds() % 2) {
                    console.log('success');
                    location.href = '#initialize/wifi/success';
                }
                else {
                    console.log('failure');
                    location.href = '#initialize/wifi/failure';
                }
            },
            render : function() {
                var wifi_settings = localStorage.get('setting-wifi'),
                    state = this.state;

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{state.lang.brand_name}</h1>
                        <div>
                            <h2>
                                {state.lang.wifi.set_password.line1}
                                {wifi_settings.name}
                                {state.lang.wifi.set_password.line2}
                            </h2>
                            <div>
                                <input ref="password" type="password" id="text-password"/>
                            </div>
                            <div>
                                <a href="#initialize/wifi/select" className="btn">{state.lang.wifi.set_password.cancel}</a>
                                <button id="btn-access-wifi" onClick={this._handleSetPassword} className="btn">{state.lang.wifi.set_password.join}</button>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
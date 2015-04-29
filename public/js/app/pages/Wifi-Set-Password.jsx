define([
    'jquery',
    'react',
    'helpers/local-storage',
    'app/actions/wifi-set-password',
    'css!cssHome/pages/wifi'
], function($, React, localStorage, actions) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
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
                                    <input type="password" id="text-password"/>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/select" className="btn">{state.lang.wifi.set_password.cancel}</a>
                                    <button id="btn-access-wifi" className="btn">{state.lang.wifi.set_password.join}</button>
                                </div>
                            </div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                },

                componentDidMount : function() {
                    actions();
                }

            });

        return Page;
    };
});
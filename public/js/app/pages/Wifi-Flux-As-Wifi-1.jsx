define([
    'jquery',
    'react',
    'css!cssHome/pages/wifi'
], function($, React, localStorage, actions) {
    'use strict';

    return function(args) {

        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            componentDidMount : function() {
            },
            render : function() {
                var lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-flux-ap.png" />
                        <div className="wifi-form">
                            <h2>{lang.wifi.flux_as_wifi_1.caption}</h2>
                            <p>{lang.wifi.flux_as_wifi_1.description}</p>
                            <div>
                                <a href="#initialize/wifi/flux-as-wifi-2" className="btn btn-large">
                                    {lang.wifi.flux_as_wifi_1.next}
                                </a>
                            </div>
                            <div>
                                <a href="#initialize/wifi/ask">{lang.wifi.flux_as_wifi_1.footer}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
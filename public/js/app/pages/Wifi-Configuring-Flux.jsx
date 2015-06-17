define([
    'jquery',
    'react'
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
                            <h2>{lang.wifi.configuring_flux.caption}</h2>
                            <p>{lang.wifi.configuring_flux.description}</p>
                            <div>
                                <a href="#initialize/wifi/configured-flux" className="btn btn-large">
                                    {lang.wifi.configuring_flux.next}
                                </a>
                            </div>
                            <div>
                                <a href="#initialize/wifi/ask">{lang.wifi.configuring_flux.footer}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
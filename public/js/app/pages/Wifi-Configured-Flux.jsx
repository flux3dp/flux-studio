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
            _next: function(e) {
                // TODO: call api
                location.href = '#initialize/wifi/setup-complete';
            },
            render : function() {
                var lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-flux-ap-success.png" />
                        <div className="wifi-form">
                            <h2>{lang.wifi.configured_flux.caption}</h2>
                            <p>{lang.wifi.configured_flux.description}</p>
                            <div>
                                <button className="btn btn-large" onClick={this._next}>
                                    {lang.wifi.configured_flux.next}
                                </button>
                            </div>
                            <div>
                                <a href="#initialize/wifi/ask">{lang.wifi.configured_flux.footer}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
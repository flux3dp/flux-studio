define([
    'jquery',
    'react',
    'helpers/local-storage'
], function($, React, localStorage) {
    'use strict';

    return function(args) {

        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            componentDidMount: function() {
            },
            _handleStartClick: function() {
                localStorage.set('printer-is-ready', true);
                location.href = '#studio/print';
            },
            render : function() {
                var lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center text-center">
                        <h1>{lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-done.png" />
                        <div className="wifi-form">
                            <h2>{lang.wifi.setup_complete.caption}</h2>
                            <p>{lang.wifi.setup_complete.description}</p>
                            <div>
                                <button className="btn btn-action btn-large" onClick={this._handleStartClick}>{lang.wifi.setup_complete.start}</button>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
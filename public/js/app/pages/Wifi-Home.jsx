define([
    'jquery',
    'react',
    'jsx!widgets/Modal'
], function($, React, Modal) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            render : function() {
                var content = (
                    <div className="wifi initialization text-center">
                        <h1>{this.state.lang.welcome_headline}</h1>
                        <img className="wifi-symbol" src="/img/img-wifi.png"/>
                        <div className="wifi-form">
                            <h2>{this.state.lang.wifi.home.line1}</h2>
                            <p>{this.state.lang.wifi.home.line2}</p>
                            <div>
                                <a href="#initialize/wifi/select" className="btn btn-action btn-large">{this.state.lang.wifi.home.select}</a>
                            </div>
                            <div>
                                <a href="#initialize/wifi/flux-as-wifi-1">{this.state.lang.wifi.home.no_available_wifi}</a>
                            </div>
                        </div>
                    </div>
                );

                return (
                    <Modal content={content}/>
                );
            }
        });

        return Page;
    };
});
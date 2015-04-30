define([
    'jquery',
    'react',
    'css!cssHome/pages/wifi'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
                render : function() {

                    return (
                        <div className="wifi initialization absolute-center">
                            <h1>{this.state.lang.brand_name}</h1>
                            <div>
                                <h2>{this.state.lang.wifi.home.line1}</h2>
                                <p>{this.state.lang.wifi.home.line2}</p>
                                <div>
                                    <a href="#initialize/wifi/select" className="btn">{this.state.lang.wifi.home.select}</a>
                                </div>
                                <div>
                                    <a href="#initialize/wifi/ask">{this.state.lang.wifi.home.no_available_wifi}</a>
                                </div>
                            </div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                }

            });

        return Page;
    };
});
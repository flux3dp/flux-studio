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
                    var lang = this.state.lang;

                    return (
                        <div className="wifi initialization absolute-center">
                            <h1>{lang.brand_name}</h1>
                            <div>
                                <h2>{lang.wifi.success.caption}</h2>
                                <p>{lang.wifi.success.line1}</p>
                                <div>
                                    <a href="#initialize/wifi/set-printer" className="btn">{lang.wifi.success.next}</a>
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
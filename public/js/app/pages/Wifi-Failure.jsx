define([
    'jquery',
    'react',
    'css!cssHome/pages/wifi'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            render : function() {
                var lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{lang.brand_name}</h1>
                        <div>
                            <h2>{lang.wifi.failure.caption}</h2>
                            <p>{lang.wifi.failure.line1}</p>
                            <div>
                                <a href="#initialize/wifi/select" className="btn">{lang.wifi.failure.next}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
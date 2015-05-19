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

            componentDidMount: function() {
            },

            render : function() {
                var lang = this.state.lang;

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{lang.brand_name}</h1>
                        <div>
                            <img src="http://placehold.it/350x150" />
                        </div>
                        <div>
                            <h2>{lang.wifi.setup_complete.caption}</h2>
                            <span>{lang.wifi.setup_complete.description}</span>
                        </div>
                        <div>
                            <button className="btn">{lang.wifi.setup_complete.start}</button>
                        </div>
                    </div>
                )
            }
        });

        return Page;
    };
});
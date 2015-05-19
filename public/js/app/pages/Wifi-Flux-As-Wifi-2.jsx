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
                var lang = this.state.lang,
                    thisModule = this;

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{lang.brand_name}</h1>
                            <div>
                                <img src="http://placehold.it/350x150" />
                            </div>
                        <div>
                            <h2>{lang.wifi.flux_as_wifi_2.caption}</h2>
                            <span>{lang.wifi.flux_as_wifi_2.description}</span>
                        </div>
                        <div>
                            <button className="btn">{lang.wifi.flux_as_wifi_2.next}</button>
                        </div>
                        <div>
                            <span>{lang.wifi.flux_as_wifi_2.footer}</span>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
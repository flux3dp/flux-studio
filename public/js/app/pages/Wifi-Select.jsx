define([
    'jquery',
    'react',
    'app/actions/wifi-select',
    'css!cssHome/pages/wifi'
], function($, React, wifiSelect) {
    'use strict';

    return function(args) {
        args = args || {};

        // TODO: remove fake wifi spots
        args.props.items = [];

        for (var i = 0; i < 10; i++) {
            args.props.items.push({
                id: i,
                name: 'test-' + i,
                serial: i
            });
        }

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },

            componentDidMount : function() {
                wifiSelect();
            },
            render : function() {

                var state = this.state,
                    items = this.props.items.map(function(opt, i) {
                        return (<li data-wifi-id={opt.id} data-wifi-name={opt.name}>
                            <a href="#initialize/wifi/set-password">
                                <span>{opt.name}</span>
                                <span className="fa fa-wifi"></span>
                                <span className="fa fa-lock"></span>
                            </a>
                        </li>);
                    }, this);

                return (
                    <div className="wifi initialization absolute-center">
                        <h1>{state.lang.brand_name}</h1>
                        <div>
                            <h2>{state.lang.wifi.select.choose_wifi}</h2>
                            <ul className="pure-list wifi-list clearfix">
                                {items}
                            </ul>
                            <div>
                                <a href="#">{state.lang.wifi.select.no_wifi_available}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return Page;
    };
});
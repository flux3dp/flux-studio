define([
    'react',
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <ul className="menu">
                            <li className="menu-item brand-name">{lang.brand_name}</li>
                            <li className="menu-item">
                                <a href="#studio/print">{lang.menu.print}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#studio/laser">{lang.menu.laser}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#studio/scan">{lang.menu.scan}</a>
                            </li>
                            <li className="menu-item">
                                <a href="#studio/usb">{lang.menu.usb}</a>
                            </li>
                            <li className="menu-item cog sticky-bottom">
                                <a className="fa fa-cog" href="#studio/settings/general"></a>
                            </li>
                        </ul>
                    );
                },
                getInitialState: function() {
                    return args.state;
                }

            });

        return Page;
    };
});
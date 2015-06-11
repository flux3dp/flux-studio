define([
    'react',
], function(React) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
                _handleNavigation: function(address, e) {
                    location.href = '#studio/' + address;
                },
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <ul className="menu">
                            <li className="menu-item brand-name">
                                <img src="/img/logo-flux.png"/></li>
                            <li className="menu-item" onClick={this._handleNavigation.bind(null, 'print')}>
                                <img src="/img/icon-printer.png" />
                                <a>{lang.menu.print}</a>
                            </li>
                            <li className="menu-item" onClick={this._handleNavigation.bind(null, 'laser')}>
                                <img src="/img/icon-laser.png" />
                                <a>{lang.menu.laser}</a>
                            </li>
                            <li className="menu-item" onClick={this._handleNavigation.bind(null, 'scan')}>
                                <img src="/img/icon-scan.png" />
                                <a>{lang.menu.scan}</a>
                            </li>
                            <li className="menu-item" onClick={this._handleNavigation.bind(null, 'usb')}>
                                <img src="http://placehold.it/34x34" />
                                <a>{lang.menu.usb}</a>
                            </li>
                            <li className="menu-item sticky-bottom" onClick={this._handleNavigation.bind(null, 'settings')}>
                                <img src="/img/icon-setting.png" />
                                <a href="#studio/settings/general"></a>
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
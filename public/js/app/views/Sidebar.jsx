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
                    var self = this,
                        lang = this.state.lang,
                        cx = React.addons.classSet,
                        genericClassName = {
                            'side-bar-item': true,
                            'active': false
                        },
                        settingsClassName = {
                            'side-bar-item': true,
                            'sticky-bottom': true,
                            'active': false
                        },
                        options = [
                            {
                                name: 'print',
                                className: genericClassName,
                                label: lang.menu.print,
                                imgSrc: '/img/icon-printer.png'
                            },
                            {
                                name: 'laser',
                                className: genericClassName,
                                label: lang.menu.laser,
                                imgSrc: '/img/icon-laser.png'
                            },
                            {
                                name: 'scan',
                                className: genericClassName,
                                label: lang.menu.scan,
                                imgSrc: '/img/icon-scan.png'
                            },
                            {
                                name: 'usb',
                                className: genericClassName,
                                label: lang.menu.usb,
                                imgSrc: 'http://placehold.it/34x34'
                            },
                            {
                                name: 'settings',
                                className: settingsClassName,
                                label: lang.menu.usb,
                                imgSrc: '/img/icon-setting.png'
                            }
                        ],
                        menuItems = options.map(function(opt) {
                            var isActiveItem = -1 < location.hash.indexOf(opt.name),
                                itemClass = '';

                            opt.className.active = isActiveItem;
                            itemClass = cx(opt.className);

                            return (
                                <li className={itemClass} onClick={self._handleNavigation.bind(null, opt.name)}>
                                    <img src={opt.imgSrc} />
                                    <p>{opt.label}</p>
                                </li>
                            );
                        }, this);

                    return (
                        <ul className="side-bar">
                            <li className="brand-name">
                                <img src="/img/logo-flux.png"/>
                            </li>
                            {menuItems}
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
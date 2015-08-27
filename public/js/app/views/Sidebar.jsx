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
                            'item': true,
                            'menu-item': true,
                            'active': false
                        },
                        settingsClassName = {
                            'item': true,
                            'menu-item': true,
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
                                name: 'device',
                                className: genericClassName,
                                label: lang.menu.device,
                                imgSrc: '/img/device.png'
                            },
                            {
                                name: 'settings',
                                className: settingsClassName,
                                label: '',
                                imgSrc: '/img/icon-setting.png'
                            }
                        ],
                        menuItems = options.map(function(opt, i) {
                            var isActiveItem = -1 < location.hash.indexOf(opt.name),
                                itemClass = '',
                                label = '';

                            if ('' !== opt.label) {
                                label = (<p>{opt.label}</p>);
                            }

                            opt.className.active = isActiveItem;
                            itemClass = cx(opt.className);

                            return (
                                <li className={itemClass} key={'menu' + i} onClick={self._handleNavigation.bind(null, opt.name)}>
                                    <img src={opt.imgSrc} />
                                    {label}
                                </li>
                            );
                        }, this);

                    return (
                        <ul className="side-bar">
                            <li className="item">
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

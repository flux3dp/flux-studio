define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function(React, Modal, Alert) {
    'use strict';

    return function(args) {
        args = args || {};

        return React.createClass({
            _handleNavigation: function(address, e) {
                location.hash = '#studio/' + address;
            },
            render : function() {
                var self = this,
                    lang = this.state.lang,
                    cx = React.addons.classSet,
                    genericClassName = {
                        'item': true
                    },
                    options = [
                        {
                            name: 'print',
                            className: genericClassName,
                            label: lang.menu.print,
                            imgSrc: '/img/menu/icon_print.svg'
                        },
                        {
                            name: 'laser',
                            className: genericClassName,
                            label: lang.menu.laser,
                            imgSrc: '/img/menu/icon_laser.svg'
                        },
                        {
                            name: 'scan',
                            className: genericClassName,
                            label: lang.menu.scan,
                            imgSrc: '/img/menu/icon_scan.svg'
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

                // TODO: test alert modal
                var message = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel itaque atque perferendis consequuntur corrupti quos, dolorem voluptatem dolores minus, voluptatibus, commodi modi quas beatae optio asperiores explicabo ipsa nostrum mollitia.';
                // var message = 'Lorem ipsum';
                // message += message;
                // message += message;
                // message += message;
                // message += message;
                var callback = function(e) {
                        console.log(e.currentTarget);
                    },
                    buttonOptions = [
                        { label: 'ok', onClick: callback },
                        { label: 'retry', onClick: callback },
                        { label: 'exit', onClick: callback },
                    ];

                var content = (
                    <Alert message={message} caption="Error" buttons={buttonOptions}/>
                );
                return (
                    <Modal content={content}/>
                );

                return (
                    <div>
                        <div className="brand-logo">
                            <img className="logo-icon" src="/img/menu/icon_menu.svg"/>
                            <div className="menu">
                                <svg width="54" height="12"
                                     className="arrow"
                                     viewPort="0 0 54 12" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg">

                                    <polygon points="0,0 54,0 54,12"/>

                                </svg>
                                <ul className="inner-menu">
                                    {menuItems}
                                </ul>
                            </div>
                        </div>

                        <a href="#studio/settings" className="setting inner-menu">
                            <div className="item" onClick={self._handleNavigation.bind(null, 'settings')}>
                                <img src="/img/menu/icon_setting.svg" />
                                <p>{lang.menu.setting}</p>
                            </div>
                        </a>
                    </div>
                );
            },
            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            }

        });
    };
});

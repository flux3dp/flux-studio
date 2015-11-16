define([
    'react',
    'lib/jquery.growl',
    'app/actions/Alert-Actions',
    'app/stores/Alert-Store',
    'jsx!widgets/Notification-Modal',
], function(React, Notifier, AlertActions, AlertStore, Modal) {
    'use strict';

    return function(args) {
        args = args || {};
        return React.createClass({

            getInitialState: function() {
                return {
                    lang        : args.state.lang,
                    sourceId    : '',
                    showModal   : false
                };
            },

            componentDidMount: function() {
                AlertStore.onNotify(this._handleNotification);
                AlertStore.onPopup(this._handlePopup);
            },

            componentWillUnmount: function() {
                AlertStore.removeNotifyListener(this._handleNotification);
                AlertStore.removePopupListener(this._handlePopup);
            },

            _handleNotification: function(type, message) {
                var self = this;
                var types = {
                    0: function() {
                        $.growl.notice({
                            title: self.state.lang.alert.info,
                            message: message
                        });
                    },

                    1: function() {
                        $.growl.warning({
                            title: self.state.lang.alert.warning,
                            message: message
                        });
                    },

                    2: function() {
                        $.growl.error({
                            title: self.state.lang.alert.error,
                            message: message,
                            fixed: true
                        });
                    }
                };

                types[type]();
            },

            _handlePopup: function(type, id, message) {
                this.setState({
                    showModal   : true,
                    type        : type,
                    sourceId    : id,
                    message     : message
                });
            },

            _handleNavigation: function(address) {
                location.hash = '#studio/' + address;
            },

            _handleModalClose: function() {
                this.setState({ showModal: false });
            },

            _handleRetry: function() {
                AlertActions.notifyRetry(this.state.sourceId);
            },

            _handleModalOpen: function() {

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
                            displayName: 'PRINT',
                            className: genericClassName,
                            label: lang.menu.print,
                            imgSrc: '/img/menu/icon_print.svg'
                        },
                        {
                            name: 'laser',
                            displayName: 'LASER',
                            className: genericClassName,
                            label: lang.menu.laser,
                            imgSrc: '/img/menu/icon_laser.svg'
                        },
                        {
                            name: 'scan',
                            displayName: 'SCAN',
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
                            <li className={itemClass} key={'menu' + i} data-display-name={opt.displayName} onClick={self._handleNavigation.bind(null, opt.name)}>
                                <img src={opt.imgSrc} />
                                {label}
                            </li>
                        );
                    }, this),
                    currentWorkingFunction = options.filter(function(el) {
                        return -1 < location.hash.search(el.name);
                    })[0];

                currentWorkingFunction = currentWorkingFunction || {};

                return (
                    <div>
                        <div className="brand-logo">
                            <img className="logo-icon" src="/img/menu/main_logo.svg"/>
                            <span className="func-name">{currentWorkingFunction.displayName}</span>
                            <div className="menu">
                                <svg width="36" height="15"
                                     className="arrow"
                                     viewBox="0 0 36 15" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg">

                                    <polygon points="0,0 36,0 36,15"/>

                                </svg>
                                <ul className="inner-menu">
                                    {menuItems}
                                </ul>
                            </div>
                        </div>

                        <Modal
                            lang={lang}
                            type={this.state.type}
                            open={this.state.showModal}
                            message={this.state.message}
                            onRetry={this._handleRetry}
                            onClose={this._handleModalClose} />

                        <a href="#studio/settings" className="setting inner-menu">
                            <div className="item" onClick={self._handleNavigation.bind(null, 'settings')}>
                                <img src="/img/menu/icon_setting.svg" />
                                <p>{lang.menu.setting}</p>
                            </div>
                        </a>
                    </div>
                );
            }

        });
    };
});

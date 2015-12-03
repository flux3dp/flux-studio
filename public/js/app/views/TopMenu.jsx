define([
    'react',
    'lib/jquery.growl',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app//constants/alert-constants',
    'jsx!widgets/Notification-Modal',
    'jsx!views/Print-Selector',
    'helpers/api/discover',
    'helpers/api/config',
    'helpers/device-master',
    'plugins/classnames/index'
], function(
    React,
    Notifier,
    AlertActions,
    AlertStore,
    AlertConstants,
    Modal,
    PrinterSelector,
    Discover,
    Config,
    DeviceMaster,
    ClassNames
) {
    'use strict';

    return function(args) {
        args = args || {};
        var lang = args.state.lang,
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
            ];

        return React.createClass({

            getInitialState: function() {
                return {
                    sourceId        : '',
                    showModal       : false,
                    deviceList      : [],
                    refresh         : '',
                    showDeviceList  : false
                };
            },

            componentDidMount: function() {
                AlertStore.onNotify(this._handleNotification);
                AlertStore.onPopup(this._handlePopup);
                DeviceMaster.setLanguageSource(lang);
            },

            componentWillUnmount: function() {
                AlertStore.removeNotifyListener(this._handleNotification);
                AlertStore.removePopupListener(this._handlePopup);
            },

            _closeDeviceList: function() {

            },

            _handleNotification: function(type, message) {
                var self = this;

                var types = {
                    INFO: function() {
                        $.growl.notice({
                            title: self.state.lang.alert.info,
                            message: message
                        });
                    },

                    WARNING: function() {
                        $.growl.warning({
                            title: self.state.lang.alert.warning,
                            message: message
                        });
                    },

                    ERROR: function() {
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

            _handleAbort: function() {
                AlertActions.notifyAbort(this.state.sourceId);
            },

            _handleShowDeviceList: function() {
                var self = this,
                    refreshOption = function(devices) {
                        self.setState({
                            deviceList: devices
                        });
                    };

                if (false === window.FLUX.debug) {
                    Config().read('printers', {
                        onFinished: function(response) {
                            options = JSON.parse(response || '[]');

                            refreshOption(options);
                        }
                    });
                }
                else {
                    Discover(function(printers) {
                        refreshOption(printers);
                    });
                }

                this.setState({ showDeviceList: !this.state.showDeviceList });
            },

            _handleSelectDevice: function(uuid, e) {
                e.preventDefault();
                DeviceMaster.setPassword('flux');
                DeviceMaster.selectDevice(uuid);
                this.setState({ showDeviceList: false });
            },

            _renderStudioFunctions: function() {
                var ClassNames = React.addons.classSet,
                    menuItems;

                menuItems = options.map(function(opt, i) {
                    var isActiveItem = -1 < location.hash.indexOf(opt.name),
                        itemClass = '',
                        label = '';

                    if ('' !== opt.label) {
                        label = (<p>{opt.label}</p>);
                    }

                    opt.className.active = isActiveItem;
                    itemClass = ClassNames(opt.className);

                    return (
                        <li className={itemClass} key={'menu' + i}
                            data-display-name={opt.displayName}
                            onClick={this._handleNavigation.bind(null, opt.name)}>
                            <img src={opt.imgSrc} />
                            {label}
                        </li>
                    );
                }, this);

                return menuItems;
            },

            _renderDeviceList: function() {
                var list = this.state.deviceList.map(function(device) {
                    return (
                        <li
                            name={device.uuid}
                            onClick={this._handleSelectDevice.bind(null, device.uuid)}>
                            <label className="name">{device.name}</label>
                            <label className="status">Working / Print / 35%</label>
                        </li>
                    )
                }, this);

                return (
                    <ul>{list}</ul>
                );
            },

            render : function() {
                var menuItems = this._renderStudioFunctions(),
                    deviceList = this._renderDeviceList(),
                    currentWorkingFunction,
                    menuClass;

                currentWorkingFunction = options.filter(function(el) {
                    return -1 < location.hash.search(el.name);
                })[0] || {};

                menuClass = ClassNames('menu', { show: this.state.showDeviceList });

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
                            onAbort={this._handleAbort}
                            onClose={this._handleModalClose} />

                        <div className="device" onClick={this._handleShowDeviceList}>
                            <img src="/img/btn-device.svg" />
                            <p>{lang.menu.device}</p>
                            <div className={menuClass}>
                                <svg width="36" height="15"
                                     className="arrow"
                                     viewBox="0 0 36 15" version="1.1"
                                     xmlns="http://www.w3.org/2000/svg">

                                    <polygon points="36,0 0,15 0,0"/>

                                </svg>
                                <div className="device-list">
                                    {deviceList}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

        });
    };
});

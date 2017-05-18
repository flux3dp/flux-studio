define([
    'jquery',
    'react',
    'app/app-settings',
    'helpers/detect-webgl',
    'helpers/api/discover',
    'helpers/device-master',
    'plugins/classnames/index',
    'app/constants/device-constants',
    'jsx!views/print/Monitor',
    'jsx!widgets/Modal',
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/actions/global-actions',
    'app/stores/global-store',
    'helpers/device-list',
    'app/actions/progress-actions',
    'app/constants/progress-constants'
], function(
    $,
    React,
    appSettings,
    detectWebgl,
    Discover,
    DeviceMaster,
    ClassNames,
    DeviceConstants,
    Monitor,
    Modal,
    AlertActions,
    AlertStore,
    GlobalActions,
    GlobalStore,
    DeviceList,
    ProgressActions,
    ProgressConstants
) {
    'use strict';

    return function(args) {
        args = args || {};
        var _id = 'TopMenu',
            lang = args.state.lang,
            genericClassName = {
                'item': true
            },
            options = [
                {
                    name: 'print',
                    displayName: 'PRINT',
                    className: genericClassName,
                    label: lang.menu.print,
                    imgSrc: 'img/menu/icon_print.svg'
                },
                {
                    name: 'laser',
                    displayName: 'ENGRAVE',
                    className: genericClassName,
                    label: lang.menu.laser,
                    imgSrc: 'img/menu/icon_laser.svg'
                },
                {
                    name: 'scan',
                    displayName: 'SCAN',
                    className: genericClassName,
                    label: lang.menu.scan,
                    imgSrc: 'img/menu/icon_scan.svg'
                },
                {
                    name: 'draw',
                    displayName: 'DRAW',
                    className: genericClassName,
                    label: lang.menu.draw,
                    imgSrc: 'img/menu/icon-draw.svg'
                },
                {
                    name: 'cut',
                    displayName: 'CUT',
                    className: genericClassName,
                    label: lang.menu.cut,
                    imgSrc: 'img/menu/icon-cut.svg'
                },
            ];

        // Special Feature
        if (window.FLUX && window.FLUX.dev) {
            options.push({
                name: 'mill',
                displayName: 'Mill',
                className: genericClassName,
                label: lang.menu.mill,
                imgSrc: 'img/menu/icon-draw.svg'
            });
        }

        return React.createClass({

            getDefaultProps: function() {
                return {
                    show: true
                };
            },

            getInitialState: function() {
                return {
                    sourceId        : '',
                    deviceList      : [],
                    refresh         : '',
                    showDeviceList  : false,
                    customText      : '',
                    fcode           : {},
                    previewUrl      : ''
                };
            },

            componentDidMount: function() {
                this._toggleDeviceListBind = this._toggleDeviceList.bind(null, false);

                AlertStore.onCancel(this._toggleDeviceListBind);
                AlertStore.onRetry(this._waitForPrinters);
                GlobalStore.onMonitorClosed(this._toggleDeviceListBind);

                DeviceMaster.startMonitoringUsb();
            },

            componentWillUnmount: function() {
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                AlertStore.removeRetryListener(this._waitForPrinters);
                GlobalStore.removeMonitorClosedListener(this._toggleDeviceListBind);
            },

            _waitForPrinters: function() {
                setTimeout(this._openAlertWithnoPrinters, 5000);
            },

            _openAlertWithnoPrinters: function() {
                if (0 === this.state.deviceList.length && true === this.state.showDeviceList) {
                    AlertActions.showPopupRetry('no-printer', lang.device_selection.no_printers);
                }
            },

            _toggleDeviceList: function(open) {
                this.setState({
                    showDeviceList: open
                });

                if (true === open) {
                    this._waitForPrinters();
                }
            },

            _handleNavigation: function(address) {
                if (-1 < appSettings.needWebGL.indexOf(address) && false === detectWebgl()) {
                    AlertActions.showPopupError('no-webgl-support', lang.support.no_webgl);
                }
                else {
                    location.hash = '#studio/' + address;
                }
            },

            _handleShowDeviceList: function() {
                var self = this,
                    refreshOption = function(devices) {
                        self.setState({
                            deviceList: devices
                        });
                    };

                Discover(
                    'top-menu',
                    function(printers) {
                        printers = DeviceList(printers);
                        refreshOption(printers);
                    }
                );

                this._toggleDeviceList(!this.state.showDeviceList);
            },

            _handleSelectDevice: function(device, e) {
                e.preventDefault();
                AlertStore.removeCancelListener(this._toggleDeviceListBind);
                ProgressActions.open(ProgressConstants.NONSTOP_WITH_MESSAGE, lang.initialize.connecting);
                DeviceMaster.selectDevice(device).then(function(status) {
                    console.log('Select device ', status);
                    if (status === DeviceConstants.CONNECTED) {
                        ProgressActions.close();
                        GlobalActions.showMonitor(device);
                    }
                    else if (status === DeviceConstants.TIMEOUT) {
                        ProgressActions.close();
                        AlertActions.showPopupError(_id, lang.message.connectionTimeout);
                    }
                })
                .fail(function(status) {
                    ProgressActions.close();
                    AlertActions.showPopupError('fatal-occurred', status);
                });

                this._toggleDeviceList(false);
            },

            _handleMonitorClose: function() {
                this.setState({
                    showMonitor: false
                });
            },

            _renderStudioFunctions: function() {
                var itemClass = '',
                    label = '',
                    isActiveItem,
                    menuItems;

                menuItems = options.map(function(opt, i) {
                    isActiveItem = -1 < location.hash.indexOf(opt.name);
                    itemClass = '';
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
                            <img src={opt.imgSrc} draggable="false"/>
                            {label}
                        </li>
                    );
                }, this);

                return menuItems;
            },

            _renderDeviceList: function() {
                var status = lang.machine_status,
                    headModule = lang.head_module,
                    statusText,
                    headText,
                    progress,
                    deviceList = this.state.deviceList,
                    options = deviceList.map(function(device) {
                        statusText = status[device.st_id] || status.UNKNOWN;
                        headText = headModule[device.head_module] || headModule.UNKNOWN;

                        if(device.st_prog === 0) {
                            progress = '';
                        }
                        else if (16 === device.st_id && 'number' === typeof device.st_prog) {
                            progress = (parseInt(device.st_prog * 1000) * 0.1).toFixed(1) + '%';
                        }
                        else {
                            progress = '';
                        }

                        let img = `img/icon_${device.source === 'h2h' ? 'usb' : 'wifi' }.svg`;

                        return (
                            <li
                                name={device.uuid}
                                onClick={this._handleSelectDevice.bind(null, device)}>
                                <label className="name">{device.name}</label>
                                <label className="status">{headText} {statusText}</label>
                                <label className="progress">{progress}</label>
                                <label className="connection-type">
                                    <div className="type">
                                        <img src={img} />
                                    </div>
                                </label>
                            </li>
                        );
                    }, this),
                    list;

                list = (
                    0 < options.length
                    ? options :
                    [<div className="spinner-roller spinner-roller-reverse"/>]
                );

                return (
                    <ul>{list}</ul>
                );
            },

            render : function() {
                var menuItems  = this._renderStudioFunctions(),
                    deviceList = this._renderDeviceList(),
                    currentWorkingFunction,
                    menuClass,
                    topClass;

                currentWorkingFunction = options.filter(function(el) {
                    return -1 < location.hash.search(el.name);
                })[0] || {};

                menuClass = ClassNames('menu', { show: this.state.showDeviceList });
                topClass = {
                    'hide': !this.props.show
                };

                return (
                    <div className={ClassNames(topClass)}>
                        <div className="brand-logo">
                            <img className="logo-icon" src="img/menu/main_logo.svg" draggable="false"/>
                            <span className="func-name">{currentWorkingFunction.displayName}</span>
                            <div className="menu">
                                <div className="arrow arrow-left arrow-top-left-flat"/>
                                <ul className="inner-menu">
                                    {menuItems}
                                </ul>
                            </div>
                        </div>

                        <div title={lang.print.deviceTitle} className="device" onClick={this._handleShowDeviceList}>
                            <p className="device-icon">
                                <img src="img/btn-device.svg" draggable="false"/>
                                <span>{lang.menu.device}</span>
                            </p>
                            <div className={menuClass}>
                                <div className="arrow arrow-right"/>
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

define([
    'jquery',
    'react',
    'lib/jquery.growl',
    // alert dialog
    'app/actions/alert-actions',
    'app/stores/alert-store',
    'app/constants/alert-constants',
    // progress dialog
    'app/actions/progress-actions',
    'app/stores/progress-store',
    'app/constants/progress-constants',
    // input lightbox dialog
    'app/actions/input-lightbox-actions',
    'app/stores/input-lightbox-store',
    'app/constants/input-lightbox-constants',
    'jsx!widgets/Progress',
    'jsx!widgets/Input-Lightbox',
    'jsx!widgets/Notification-Modal',
    'jsx!views/Print-Selector',
    'jsx!views/Update-Dialog',
    'helpers/api/discover',
    'helpers/api/config',
    'helpers/device-master',
    'plugins/classnames/index',
    'app/actions/global-actions',
    'app/stores/global-store',
    'app/constants/device-constants',
    'jsx!views/print/Monitor',
    'jsx!widgets/Modal'
], function(
    $,
    React,
    Notifier,
    // alert
    AlertActions,
    AlertStore,
    AlertConstants,
    // progress
    ProgressActions,
    ProgressStore,
    ProgressConstants,
    // input lightbox
    InputLightboxActions,
    InputLightboxStore,
    InputLightboxConstants,
    Progress,
    InputLightbox,
    NotificationModal,
    PrinterSelector,
    UpdateDialog,
    Discover,
    Config,
    DeviceMaster,
    ClassNames,
    GlobalActions,
    GlobalStore,
    DeviceConstants,
    Monitor,
    Modal
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
                var self = this;

                return {
                    sourceId        : '',
                    showNotificationModal       : false,
                    showMonitor     : false,
                    deviceList      : [],
                    refresh         : '',
                    showDeviceList  : false,
                    customText      : '',
                    fcode           : {},
                    previewUrl      : '',
                    // progress
                    progress: {
                        open       : false,
                        caption    : '',
                        message    : '',
                        percentage : 0,
                        type       : '',
                        onFinished : function() {}
                    },
                    // input lightbox
                    inputLightbox: {
                        open         : false,
                        type         : '',
                        caption      : '',
                        inputHeader  : '',
                        defaultValue : '',
                        confirmText  : '',
                        onClose      : function() {},
                        onSubmit     : function() {}
                    },
                    // firmware update
                    firmware: {
                        open: false,
                        type: 'firmware',
                        releaseNote: '',
                        latestVersion: '',
                        updateFile: undefined,
                        device: {}
                    }
                };
            },

            componentDidMount: function() {
                AlertStore.onNotify(this._handleNotification);
                AlertStore.onPopup(this._handlePopup);
                AlertStore.onFirmwareUpdate(this._showFirmwareUpdate);
                ProgressStore.onOpened(this._handleProgress).
                    onUpdating(this._handleProgress).
                    onClosed(this._handleProgressFinish);
                InputLightboxStore.onInputLightBoxOpened(this._handleInputLightBoxOpen);
                GlobalStore.onShowMonitor(this._handleOpenMonitor);
                DeviceMaster.setLanguageSource(lang);
            },

            componentWillUnmount: function() {
                AlertStore.removeNotifyListener(this._handleNotification);
                AlertStore.removePopupListener(this._handlePopup);
                // progress
                ProgressStore.removeOpenedListener(this._handleProgress).
                    removeUpdatingListener(this._handleProgress).
                    removeClosedListener(this._handleProgressFinish);

                // input lightbox
                InputLightboxStore.removeOpenedListener(this._handleInputLightBoxOpen);
            },

            _showFirmwareUpdate: function(payload) {
                this.setState({
                    firmware: {
                        open: true,
                        device: payload.device,
                        latestVersion: payload.updateInfo.latest_version,
                        releaseNote: payload.updateInfo.changelog,
                    }
                });
            },

            _handleFirmwareClose: function() {
                this.setState({
                    firmware: {
                        open: false
                    }
                });
            },

            _handleFirmwareInstall: function() {
                // TODO: to be implement
            },

            _handleInputLightBoxOpen: function(payload) {
                this.setState({
                    inputLightbox: {
                        open         : true,
                        type         : payload.type,
                        caption      : payload.caption,
                        inputHeader  : payload.inputHeader,
                        defaultValue : payload.defaultValue,
                        confirmText  : payload.confirmText,
                        onClose      : payload.onClose || function() {},
                        onSubmit     : payload.onSubmit || function() {}
                    }
                });
            },

            _handleInputLightBoxClosed: function(e, reactid, from) {
                this.setState({
                    inputLightbox: {
                        open: false
                    }
                });

                if ('' === from && 'function' === typeof this.state.inputLightbox) {
                    this.state.inputLightbox.onClose();
                }
            },

            _handleInputLightBoxSubmit: function(value) {
                this.state.inputLightbox.onSubmit(value);
            },

            _handleProgress: function(payload) {
                var self = this;

                this.setState({
                    progress: {
                        open: true,
                        caption: payload.caption || self.state.progress.caption || '',
                        message: payload.message || '',
                        percentage: payload.percentage || 0,
                        type: payload.type || self.state.progress.type || ProgressConstants.WAITING,
                        onFinished: payload.onFinished || self.state.progress.onFinished || function() {}
                    }
                });
            },

            _handleProgressFinish: function() {
                var self = this;

                self.state.progress.onFinished();

                self.setState({
                    progress: {
                        open: false,
                        onFinished: self.state.progress.onFinished
                    }
                });
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
                    showNotificationModal   : true,
                    type        : type,
                    sourceId    : id,
                    message     : message
                });
            },

            _handleNavigation: function(address) {
                location.hash = '#studio/' + address;
            },

            _handleNotificationModalClose: function(e, reactid, from) {
                var from = from || '';

                this.setState({ showNotificationModal: false });

                if ('' === from) {
                    AlertActions.notifyCancel(this.state.sourceId);
                }
            },

            _handleRetry: function() {
                AlertActions.notifyRetry(this.state.sourceId);
            },

            _handleAbort: function() {
                AlertActions.notifyAbort(this.state.sourceId);
            },

            _handleYes: function() {
                AlertActions.notifyYes(this.state.sourceId);
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

            _handleSelectDevice: function(device, e) {
                e.preventDefault();
                // AlertActions.showInfo(lang.message.connecting);
                DeviceMaster.selectDevice(device).then(function(status) {
                    if(status === DeviceConstants.CONNECTED) {
                        GlobalActions.showMonitor(device);
                    }
                    else if (status === DeviceConstants.TIMEOUT) {
                        AlertActions.showPopupError(_id, lang.message.connectionTimeout);
                    }
                });

                this.setState({ showDeviceList: false });
            },

            _handleOpenMonitor: function(selectedDevice, fcode, previewUrl) {
                this.setState({
                    fcode: fcode,
                    showMonitor: true,
                    selectedDevice: selectedDevice,
                    previewUrl: previewUrl
                });
                console.log(selectedDevice, fcode);
            },

            _handleMonitorClose: function() {
                this.setState({
                    showMonitor: false
                });
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
                            onClick={this._handleSelectDevice.bind(null, device)}>
                            <label className="name">{device.name}</label>
                            <label className="status">Working / Print / 35%</label>
                        </li>
                    )
                }, this);

                return (
                    <ul>{list}</ul>
                );
            },

            _renderMonitorPanel: function() {
                var content = (
                    <Monitor
                        lang                = {lang}
                        selectedDevice      = {this.state.selectedDevice}
                        fCode               = {this.state.fcode}
                        previewUrl          = {this.state.previewUrl}
                        onClose             ={this._handleMonitorClose} />
                );
                return (
                    <Modal
                        {...this.props}
                        lang    = {lang}
                        content ={content} />
                );
            },

            render : function() {
                var menuItems       = this._renderStudioFunctions(),
                    deviceList      = this._renderDeviceList(),
                    monitorPanel    = this.state.showMonitor ? this._renderMonitorPanel() : '',
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

                        <UpdateDialog
                            open={this.state.firmware.open}
                            type="firmware"
                            device={this.state.firmware.device}
                            latestVersion={this.state.firmware.latestVersion}
                            releaseNote={this.state.firmware.releaseNote}
                            onClose={this._handleFirmwareClose}
                            onInstall={this._handleFirmwareInstall}
                        />

                        <Progress
                            lang={lang}
                            isOpen={this.state.progress.open}
                            caption={this.state.progress.caption}
                            message={this.state.progress.message}
                            type={this.state.progress.type}
                            percentage={this.state.progress.percentage}
                            onFinished={this._handleProgressFinish}
                        />

                        <InputLightbox
                            isOpen={this.state.inputLightbox.open}
                            caption={this.state.inputLightbox.caption}
                            type={this.state.inputLightbox.type}
                            inputHeader={this.state.inputLightbox.inputHeader}
                            defaultValue={this.state.inputLightbox.defaultValue}
                            confirmText={this.state.inputLightbox.confirmText}
                            onClose={this._handleInputLightBoxClosed}
                            onSubmit={this._handleInputLightBoxSubmit}
                        />

                        <NotificationModal
                            lang={lang}
                            type={this.state.type}
                            open={this.state.showNotificationModal}
                            message={this.state.message}
                            onRetry={this._handleRetry}
                            onAbort={this._handleAbort}
                            onYes={this._handleYes}
                            onClose={this._handleNotificationModalClose} />

                        <div title={lang.print.deviceTitle} className="device" onClick={this._handleShowDeviceList}>
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

                        {monitorPanel}
                    </div>
                );
            }

        });
    };
});

define([
    'jquery',
    'react',
    'lib/jquery.growl',
    'helpers/api/config',
    'helpers/check-software-update',
    'helpers/software-updater',
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
    'jsx!views/Update-Dialog',
    'jsx!views/Change-Filament',
    'jsx!views/Head-Temperature',
    'jsx!views/beambox/Camera-Calibration',
    'app/actions/global-actions',
    'app/stores/global-store',
    'jsx!views/print/Monitor',
    'jsx!widgets/Modal',
    'helpers/api/discover',
    'helpers/check-firmware',
    'helpers/firmware-updater',
    'helpers/device-list',
    'helpers/device-master',
], function(
    $,
    React,
    Notifier,
    config,
    checkSoftwareUpdate,
    softwareUpdater,
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
    UpdateDialog,
    ChangeFilament,
    HeadTemperature,
    CameraCalibration,
    GlobalActions,
    GlobalStore,
    Monitor,
    Modal,
    discover,
    checkFirmware,
    firmwareUpdater,
    DeviceList,
    DeviceMaster
) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang,
            FIRST_DEVICE_UPDATE = 'check-first-device-firmware';

        return React.createClass({

            getInitialState: function() {
                var self = this;

                return {
                    // monitor
                    showMonitor           : false,
                    fcode                 : {},
                    previewUrl            : '',
                    monitorOpener         : null,

                    // general popup
                    showNotificationModal : false,
                    type                  : '',
                    sourceId              : '',
                    caption               : '',
                    message               : '',
                    customText            : '',

                    // progress
                    progress: {
                        open       : false,
                        caption    : '',
                        message    : '',
                        percentage : 0,
                        type       : '',
                        hasStop    : undefined,
                        onStop     : function() {},
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
                    // application update
                    application: {
                        open          : false,
                        type          : 'firmware',
                        releaseNote   : '',
                        latestVersion : '',
                        updateFile    : undefined,
                        device        : {},
                        onDownload    : function() {},
                        onInstall     : function() {}
                    },
                    // change filament
                    changeFilament: {
                        open    : false,
                        device  : {},
                        onClose : function() {}
                    },
                    headTemperature: {
                        show        : false,
                        device      : {}
                    },

                    cameraCalibration: {
                        open: false,
                        device: {}
                    },

                    firstDevice: {
                        info: {}, // device info
                        apiResponse: {}, // device info
                    },
                    // images
                    displayImages: false,
                    images: []
                };
            },

            componentDidMount: function() {
                var self = this,
                    discoverMethods,
                    firstDevice,
                    defaultPrinter,
                    isUnsupportedMacOSX = /Mac OS X 10_[56789]/.test(navigator.userAgent),
                    type = 'firmware',
                    _checkFirmwareOfDefaultPrinter = function() {
                      let printers = DeviceMaster.getAvailableDevices();
                      printers.some(function(printer) {
                        if (defaultPrinter.serial === printer.serial) {
                          defaultPrinter = printer;
                          //update default-print's data.
                          config().write('default-printer', JSON.stringify(printer));
                          return true ;
                        }
                      });

                      checkFirmware(defaultPrinter, type).done(function(response) {
                          if (response.needUpdate) {
                            firmwareUpdater(response, defaultPrinter, type);
                          }
                      });
                    };

                AlertStore.onNotify(this._handleNotification);
                AlertStore.onCloseNotify(this._handleCloseNotification);
                AlertStore.onPopup(this._handlePopup);
                AlertStore.onClosePopup(this._handleClosePopup);
                AlertStore.onUpdate(this._showUpdate);
                AlertStore.onChangeFilament(this._showChangeFilament);
                AlertStore.onShowHeadTemperature(this._showHeadTemperature);
                AlertStore.onCameraCalibration(this._showCameraCalibration);
                

                if (true === isUnsupportedMacOSX) {
                    AlertActions.showPopupError('unsupported_mac_osx', lang.message.unsupport_osx_version);
                }

                ProgressStore.onOpened(this._handleProgress)
                    .onUpdating(this._handleProgress)
                    .onClosed(this._handleProgressFinish);
                InputLightboxStore.onInputLightBoxOpened(this._handleInputLightBoxOpen);

                GlobalStore.onShowMonitor(this._handleOpenMonitor);
                GlobalStore.onCloseAllView(this._handleCloseAllView);
                GlobalStore.onSliceComplete(this._handleSliceReport);
                GlobalStore.onCloseMonitor(this._handlecloseMonitor);

                // checking FLUX studio laster version in website that is going to
                // popup update dialog if newser FLUX Studio has been relwased.

              /***waiting for website API done***
                checkSoftwareUpdate()
                  .done(function(response) {
                    softwareUpdater(response);
                  });
              /*********************************/

                // checking firmware of default printer that is going to popup
                // update dialog if newest firmware has been released.
                defaultPrinter = config().read('default-printer');
                // settimeout 15 secs for make sure discover has been done.
                if (defaultPrinter) {
                  setTimeout(_checkFirmwareOfDefaultPrinter, 15000);
                }

                // add information for Raven, to be removed when root.js is implemented
                if(!window.FLUX.dev) {
                    // Raven.setUserContext({ extra: { version: window.FLUX.version } });
                }

                this._checkOsxRequirement();

                DeviceMaster.registerUsbEvent('DASHBOARD', this._monitorUsb);
            },

            componentWillUnmount: function() {
                AlertStore.removeNotifyListener(this._handleNotification);
                AlertStore.removePopupListener(this._handlePopup);
                AlertStore.removeClosePopupListener(this._handleClosePopup);
                AlertStore.removeYesListener(this._onYes);

                // progress
                ProgressStore.removeOpenedListener(this._handleProgress).
                    removeUpdatingListener(this._handleProgress).
                    removeClosedListener(this._handleProgressFinish);

                // input lightbox
                InputLightboxStore.removeOpenedListener(this._handleInputLightBoxOpen);

                GlobalStore.removeShowMoniotorListener();
                GlobalStore.removeCloseMonitorListener();
                GlobalStore.removeCloseAllViewListener();
                GlobalStore.removeSliceCompleteListener();
            },

            _checkOsxRequirement: function() {
                if(window.FLUX.isNW && localStorage.getItem('dev') !== '1') {
                    if(process.env.osType === 'osx') {
                        let pathArray = process.env.launched.split('/');
                        if(
                            pathArray[1] !== 'Applications' &&
                            !window.FLUX.dev &&
                            !localStorage.getItem('mislaunch-warned')
                        ) {
                            AlertActions.showPopupError(
                                'LAUNCHING_FROM_INSTALLER_WARNING',
                                lang.message.launghing_from_installer_warning
                            );
                            localStorage.setItem('mislaunch-warned', true);
                        }
                    }
                }
            },

            _monitorUsb: function(usbOn) {
                if(this.state.showMonitor) {
                    if(!usbOn) {
                        this._handlecloseMonitor();
                        AlertActions.showPopupError('USB_UNPLUGGED', lang.message.usb_unplugged);
                    }
                }
            },

            _onYes: function(id) {
                var self = this;

                if (id === FIRST_DEVICE_UPDATE) {
                    // Use "setTimeout" to avoid dispatch in the middle of a dispatch
                    setTimeout(function() {
                        console.log('this is firmwate update on initial application');
                        firmwareUpdater(self.state.firstDevice.apiResponse, self.state.firstDevice.info, 'firmware');
                    }, 0);
                }
            },

            _showChangeFilament: function(payload) {
                if (false === this.state.changeFilament.open) {
                    this.setState({
                        changeFilament: {
                            open: true,
                            device: payload.device,
                            src: payload.src
                        }
                    });
                }
            },

            _showCameraCalibration: function(payload) {
                this.setState({
                    cameraCalibration: {
                        open: true,
                        device: payload.device
                    }
                });
            },

            _hideChangeFilament: function() {
                this.setState({
                    changeFilament: {
                        open: false
                    }
                });
            },

            _closeHeadTemperature: function() {
                this.setState({
                    headTemperature: {
                        show: false
                    }
                });
            },

            _showUpdate: function(payload) {
                var currentVersion = (
                      'software' === payload.type ?
                      payload.updateInfo.currentVersion :
                      payload.device.version
                    ),
                    releaseNote = (
                      'zh-tw' === localStorage['active-lang'] ?
                      payload.updateInfo.changelog_zh :
                      payload.updateInfo.changelog_en
                    );

                this.setState({
                    application: {
                        open: true,
                        device: payload.device,
                        type: payload.type,
                        currentVersion: currentVersion,
                        latestVersion: payload.updateInfo.latestVersion,
                        releaseNote: releaseNote,
                        onDownload: payload.onDownload,
                        onInstall: payload.onInstall
                    }
                });
            },

            _showHeadTemperature: function(payload) {
                if(this.state.headTemperature.show === false) {
                    this.setState({
                        headTemperature: {
                            show: true,
                            device: payload.device
                        }
                    });
                }
            },

            _handleUpdateClose: function() {
                this.setState({
                    application: {
                        open: false,
                        device: this.state.application.device
                    }
                });
            },

            _handleUpdateDownload: function() {
                this.state.application.onDownload();
            },

            _handleUpdateInstall: function() {
                this.state.application.onInstall();
            },

            _handleInputLightBoxOpen: function(payload) {
                this.setState({
                    inputLightbox: {
                        open         : true,
                        type         : payload.type,
                        caption      : payload.caption,
                        inputHeader  : payload.inputHeader,
                        defaultValue : payload.defaultValue,
                        maxLength    : payload.maxLength,
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
                else if(from === 'cancel') {
                    this.state.inputLightbox.onClose();
                }
            },

            _handleInputLightBoxSubmit: function(value) {
                return this.state.inputLightbox.onSubmit(value);
            },

            _handleProgress: function(payload) {
                var self = this,
                    hasStop;

                if ('boolean' === typeof self.state.progress.hasStop) {
                    hasStop = self.state.progress.hasStop;
                }
                else {
                    hasStop = ('boolean' === typeof payload.hasStop ? payload.hasStop : true);
                }
                this.setState({
                    progress: {
                        open: true,
                        caption: payload.caption || self.state.progress.caption || '',
                        message: payload.message || '',
                        percentage: payload.percentage || 0,
                        type: payload.type || self.state.progress.type || ProgressConstants.WAITING,
                        hasStop: hasStop,
                        onStop: payload.onStop || function() {},
                        onFinished: payload.onFinished || function() {}
                    }
                }, function() {
                    if (typeof payload.onOpened === 'function') {
                        payload.onOpened();
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

            _handleProgressStop: function(payload) {
                GlobalActions.cancelPreview();
                (this.state.progress.onStop || function() {})();
                this.setState({
                    progress: {
                        open: false,
                        onFinished: this.state.progress.onStop
                    }
                });
            },

            _handleNotification: function(type, message, onClickCallback, fixed) {
                var growl;
                fixed = fixed || false;

                var types = {
                    INFO: function() {
                        growl = $.growl.notice({
                            title   : lang.alert.info,
                            message : message,
                            fixed   : fixed,
                            location: 'bl'
                        });
                    },

                    WARNING: function() {
                        growl = $.growl.warning({
                            title   : lang.alert.warning,
                            message : message,
                            fixed   : fixed,
                            location: 'bl'
                        });
                    },

                    ERROR: function() {
                        growl = $.growl.error({
                            title   : lang.alert.error,
                            message : message,
                            fixed   : true,
                            location: 'bl'
                        });
                    }
                };

                types[type]();
                setTimeout(function() {
                    $('.growl').on('click', function() {
                        onClickCallback(growl);
                    });
                }, 500);
            },

            _handleCloseNotification: function() {
                $('#growls').remove();
            },

            _handlePopup: function(type, id, caption, message, customText, args, callback={}) {
                var customTextGroup = Array.isArray(customText) ? customText : [''];
                console.log('_handlepopup_callback', callback);

                this.setState({
                    showNotificationModal : true,
                    type                  : type,
                    sourceId              : id,
                    caption               : caption,
                    message               : message,
                    customText            : customText,
                    customTextGroup       : customTextGroup,
                    args                  : args,
                    callback              : callback,
                    displayImages         : (args && args.images != null),
                    images                : (args && args.images != null ? args.images : [] ),
                    imgClass              : (args && args.imgClass) ? args.imgClass : ''
                });
            },

            _handleClosePopup: function() {
                this.setState({ showNotificationModal: false });
            },

            _handleNotificationModalClose: function(e, reactid, from) {
                var from = from || '';

                this.setState({ showNotificationModal: false });

                if ('' === from) {
                    AlertActions.notifyCancel(this.state.sourceId);
                }
            },

            _handlePopupFeedBack: function(type) {
                console.log('sourceId', this.state.sourceId);
                switch (type) {
                case 'custom':
                    AlertActions.notifyCustom(this.state.sourceId);
                    break;
                case 'customGroup':
                    AlertActions.notifyCustomGroup(this.state.sourceId);
                    break;
                case 'retry':
                    AlertActions.notifyRetry(this.state.sourceId);
                    break;
                case 'abort':
                    AlertActions.notifyAbort(this.state.sourceId);
                    break;
                case 'yes':
                    AlertActions.notifyYes(this.state.sourceId, this.state.args);
                    break;
                }

            },

            _handleOpenMonitor: function(payload) {
                this.setState({
                    fcode: payload.fcode,
                    showMonitor: true,
                    selectedDevice: payload.printer,
                    previewUrl: payload.previewUrl,
                    monitorOpener: payload.opener
                });
            },

            _handlecloseMonitor: function() {
                this.setState({
                    showMonitor: false
                });
            },

            _handleCloseAllView: function() {
                $('.device > .menu').removeClass('show');
                $('.dialog-opener').prop('checked','');
            },

            _handleSliceReport: function(data) {
                this.setState({ slicingStatus: data.report });
            },

            _handleSetHeadTemperature: function(e) {
                DeviceMaster.setHeadTemperature(this.state.headTemperature.target);
            },

            _renderMonitorPanel: function() {
                var content = (
                    <Monitor
                        lang           = {lang}
                        selectedDevice = {this.state.selectedDevice}
                        fCode          = {this.state.fcode}
                        previewUrl     = {this.state.previewUrl}
                        slicingStatus  = {this.state.slicingStatus}
                        opener         = {this.state.monitorOpener}
                        onClose        = {this._handlecloseMonitor} />
                );
                return (
                    <Modal
                        {...this.props}
                        lang    = {lang}
                        content ={content} />
                );
            },

            _renderChangeFilament: function() {
                return (
                    <ChangeFilament
                        open={this.state.changeFilament.open}
                        device={this.state.changeFilament.device}
                        src={this.state.changeFilament.src}
                        onClose={this._hideChangeFilament}
                    />
                );
            },

            _renderHeadTemperature: function() {
                return (
                    <HeadTemperature
                        device={this.state.headTemperature.device}
                        onClose={this._closeHeadTemperature}
                    />
                );
            },

            _renderCameraCalibration: function() {
                return (
                    <CameraCalibration
                        device={this.state.cameraCalibration.device}
                        onClose={()=>{
                            this.setState({
                                cameraCalibration: {
                                    open: false,
                                    device: {}
                                }
                            });
                        }}
                    />
                );
            },

            render : function() {
                var monitorPanel = this.state.showMonitor ? this._renderMonitorPanel() : '',
                    filament = this.state.changeFilament.open ? this._renderChangeFilament() : '',
                    headTemperature = this.state.headTemperature.show ? this._renderHeadTemperature() : '',
                    cameraCalibration = this.state.cameraCalibration.open ? this._renderCameraCalibration() : '',
                    latestVersion = (
                        'toolhead' === this.state.application.type ?
                        this.state.application.device.toolhead_version :
                        this.state.application.latestVersion
                    );

                return (
                    <div className="notification-collection">
                        {monitorPanel}

                        <UpdateDialog
                            open={this.state.application.open}
                            type={this.state.application.type}
                            device={this.state.application.device}
                            currentVersion={this.state.application.currentVersion}
                            latestVersion={latestVersion}
                            releaseNote={this.state.application.releaseNote}
                            onDownload={this._handleUpdateDownload}
                            onClose={this._handleUpdateClose}
                            onInstall={this._handleUpdateInstall}
                        />

                        <InputLightbox
                            isOpen={this.state.inputLightbox.open}
                            caption={this.state.inputLightbox.caption}
                            type={this.state.inputLightbox.type || 'TEXT_INPUT'}
                            inputHeader={this.state.inputLightbox.inputHeader}
                            defaultValue={this.state.inputLightbox.defaultValue}
                            confirmText={this.state.inputLightbox.confirmText}
                            maxLength={this.state.inputLightbox.maxLength}
                            onClose={this._handleInputLightBoxClosed}
                            onSubmit={this._handleInputLightBoxSubmit}
                        />

                        {filament}
                        {headTemperature}
                        {cameraCalibration}

                        <NotificationModal
                            lang={lang}
                            type={this.state.type || 'INFO'}
                            open={this.state.showNotificationModal}
                            caption={this.state.caption}
                            message={this.state.message}
                            customText={this.state.customText}
                            customTextGroup={this.state.customTextGroup}
                            onRetry={this._handlePopupFeedBack.bind(null, 'retry')}
                            onAbort={this._handlePopupFeedBack.bind(null, 'abort')}
                            onYes={this._handlePopupFeedBack.bind(null, 'yes')}
                            onNo={this._handlePopupFeedBack.bind(null,'no')}
                            onCustom={this._handlePopupFeedBack.bind(null, 'custom')}
                            onCustomGroup={this.state.callback}
                            onClose={this._handleNotificationModalClose}
                            images={this.state.images}
                            displayImages={this.state.displayImages}
                            imgClass={this.state.imgClass}
                        />

                        <Progress
                            lang={lang}
                            isOpen={this.state.progress.open}
                            caption={this.state.progress.caption}
                            message={this.state.progress.message}
                            type={this.state.progress.type || 'NONSTOP'}
                            percentage={this.state.progress.percentage}
                            hasStop={this.state.progress.hasStop}
                            onStop={this._handleProgressStop}
                            onFinished={this._handleProgressFinish}
                        />
                    </div>
                );
            }

        });
    };
});

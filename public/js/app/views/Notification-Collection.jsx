define([
    'jquery',
    'react',
    'lib/jquery.growl',
    'helpers/api/config',
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
    'app/actions/global-actions',
    'app/stores/global-store',
    'jsx!views/print/Monitor',
    'jsx!widgets/Modal'
], function(
    $,
    React,
    Notifier,
    config,
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
    GlobalActions,
    GlobalStore,
    Monitor,
    Modal
) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang;

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
                        onInstall     : function() {}
                    },
                    // change filament
                    changeFilament: {
                        open    : false,
                        device  : {},
                        onClose : function() {}
                    }
                };
            },

            componentDidMount: function() {
                AlertStore.onNotify(this._handleNotification);
                AlertStore.onCloseNotify(this._handleCloseNotification);
                AlertStore.onPopup(this._handlePopup);
                AlertStore.onClosePopup(this._handleClosePopup);
                AlertStore.onUpdate(this._showUpdate);
                AlertStore.onChangeFilament(this._showChangeFilament);

                ProgressStore.onOpened(this._handleProgress).
                    onUpdating(this._handleProgress).
                    onClosed(this._handleProgressFinish).
                    onStop(this._handleProgressStop);
                InputLightboxStore.onInputLightBoxOpened(this._handleInputLightBoxOpen);

                GlobalStore.onShowMonitor(this._handleOpenMonitor);
                GlobalStore.onCloseAllView(this._handleCloseAllView);
                GlobalStore.onSliceComplete(this._handleSliceReport);
                GlobalStore.onCloseMonitor(this._handlecloseMonitor);

                this._checkSoftwareUpdate();
            },

            componentWillUnmount: function() {
                AlertStore.removeNotifyListener(this._handleNotification);
                AlertStore.removePopupListener(this._handlePopup);
                AlertStore.removeClosePopupListener(this._handleClosePopup);
                AlertStore.removeNotifyListener(this._handleNotification);
                // progress
                ProgressStore.removeOpenedListener(this._handleProgress).
                    removeUpdatingListener(this._handleProgress).
                    removeClosedListener(this._handleProgressFinish).
                    removeStopListener(this._handleProgressStop);

                // input lightbox
                InputLightboxStore.removeOpenedListener(this._handleInputLightBoxOpen);

                GlobalStore.removeShowMoniotorListener();
                GlobalStore.removeCloseMonitorListener();
                GlobalStore.removeCloseAllViewListener();
                GlobalStore.removeSliceCompleteListener();
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

            _hideChangeFilament: function() {
                this.setState({
                    changeFilament: {
                        open: false
                    }
                });
            },

            _showUpdate: function(payload) {
                var currentVersion = (
                    'software' === payload.type ?
                    payload.updateInfo.currentVersion :
                    payload.device.version
                );

                this.setState({
                    application: {
                        open: true,
                        device: payload.device,
                        type: payload.type,
                        currentVersion: currentVersion,
                        latestVersion: payload.updateInfo.latestVersion,
                        releaseNote: payload.updateInfo.releaseNote,
                        onInstall: payload.onInstall
                    }
                });
            },

            _handleUpdateClose: function() {
                this.setState({
                    application: {
                        open: false,
                        device: this.state.application.device
                    }
                });
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
                        onStop: payload.onStop || self.state.progress.onStop || function() {},
                        onFinished: payload.onFinished || self.state.progress.onFinished || function() {}
                    }
                }, function() {
                    if(typeof payload.onOpened === 'function') {
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
                this.state.progress.onStop();
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

            _handlePopup: function(type, id, caption, message, customText) {
                this.setState({
                    showNotificationModal : true,
                    type                  : type,
                    sourceId              : id,
                    caption               : caption,
                    message               : message,
                    customText            : customText
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
                switch (type) {
                case 'custom':
                    AlertActions.notifyCustom(this.state.sourceId);
                    break;
                case 'retry':
                    AlertActions.notifyRetry(this.state.sourceId);
                    break;
                case 'abort':
                    AlertActions.notifyAbort(this.state.sourceId);
                    break;
                case 'yes':
                    AlertActions.notifyYes(this.state.sourceId);
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

            _checkSoftwareUpdate: function() {
                var self = this,
                    data = {
                        os: ''
                    },
                    ignoreVersions = config().read('software-update-ignore-list') || [],
                    fetchProfile = function() {
                        var deferred = $.Deferred();

                        $.ajax({
                            url: 'package.json',
                            dataType: 'json'
                        }).then(function(response) {
                            if(typeof(response) === 'object') {
                                deferred.resolve(response);
                            }
                            else {
                                deferred.resolve(JSON.parse(response));
                            }
                        });

                        return deferred;
                    },
                    fetchLatestVersion = function(currentProfile) {
                        var deferred = $.Deferred();

                        data.os = (window.FLUX.osType || '') + '-' + (window.FLUX.arch || '');

                        $.ajax({
                            url: 'http://software.flux3dp.com/check-update/',
                            data: data
                        }).then(function(response) {
                            deferred.resolve(currentProfile, response);
                        });

                        return deferred;
                    };

                fetchProfile().then(fetchLatestVersion).done(function(currentProfile, currentVersion) {
                    var isIgnore = -1 < ignoreVersions.indexOf(currentVersion.latest_version);

                    if (false === isIgnore &&
                        null !== currentVersion.latest_version &&
                        currentVersion.latest_version > currentProfile.version
                    ) {
                        self._showUpdate({
                            type: 'software',
                            device: {},
                            updateInfo: {
                                currentVersion: currentProfile.version,
                                latestVersion: currentVersion.latest_version,
                                releaseNote: currentVersion.changelog,
                            },
                            onInstall: function() {
                                if (true === window.FLUX.isNW) {
                                    nw.Shell.openExternal('https://flux3dp.com/downloads/');
                                }
                                else {
                                    window.open('https://flux3dp.com/downloads/');
                                }
                            }
                        });
                    }
                });
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

            render : function() {
                var monitorPanel = this.state.showMonitor ? this._renderMonitorPanel() : '',
                    filament = this.state.changeFilament.open ? this._renderChangeFilament() : '',
                    latestVersion = (
                        'toolhead' === this.state.application.type ?
                        this.state.application.toolhead_version :
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
                            onClose={this._handleUpdateClose}
                            onInstall={this._handleUpdateInstall}
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

                        {filament}

                        <NotificationModal
                            lang={lang}
                            type={this.state.type}
                            open={this.state.showNotificationModal}
                            caption={this.state.caption}
                            message={this.state.message}
                            customText={this.state.customText}
                            onRetry={this._handlePopupFeedBack.bind(null, 'retry')}
                            onAbort={this._handlePopupFeedBack.bind(null, 'abort')}
                            onYes={this._handlePopupFeedBack.bind(null, 'yes')}
                            onCustom={this._handlePopupFeedBack.bind(null, 'custom')}
                            onClose={this._handleNotificationModalClose}
                        />

                        <Progress
                            lang={lang}
                            isOpen={this.state.progress.open}
                            caption={this.state.progress.caption}
                            message={this.state.progress.message}
                            type={this.state.progress.type}
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
